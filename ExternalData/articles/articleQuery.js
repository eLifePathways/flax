const fs = require("fs");
const { getArticles, getCMSLayout } = require('../../queries')
const { getGroupDataDir, getGroupAssetDir, storeImage } = require("../../helpers");

const getAllTheArticles = async (group, limit, offset) => {
  const articles = await getArticles(group, limit, offset)
  const cmsLayout = await getCMSLayout(group)
  const { hexCode, css } = cmsLayout
  const parsedArticles = articles.manuscriptsPublishedSinceDate.map(
    article => {

      const parsedSubmission = JSON.parse(article.submission);
      const reviews = article.reviews?.map((review) => ({
        ...review,
        jsonData: JSON.parse(review.jsonData),
      })) || [];

      const decisions = article.decisions?.map((decision) => ({
        ...decision,
        jsonData: JSON.parse(decision.jsonData),
      })) || [];

      //add index.css File
      const cssFile = getGroupAssetDir(group, hexCode, 'css/index.css')
      fs.writeFileSync(cssFile, css, 'utf8');

      const supplementaryFiles = setSupplementaryFiles(article, group, hexCode)
      const headerInfo = getHeaderInfo(article.submissionWithFields, article);
      const metaData = getMetaData(article.submissionWithFields, article)
      article.submissionWithFields = JSON.parse(article.submissionWithFields)

      return { parsedSubmission, ...article, reviews, decisions, metaData, headerInfo, supplementaryFiles };
    }
  );

  return parsedArticles
};

const setSupplementaryFiles = (article, group, hexCode) => {
  const supplementaryFiles = JSON.parse(article.supplementaryFiles)

  const supplementaryFilesDir = getGroupAssetDir(group, hexCode, 'supplementary-files')
  let updatedSupplementaryFiles = []

  if (!fs.existsSync(supplementaryFilesDir)) {
    fs.mkdir(supplementaryFilesDir, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log(`Directory created successfully!`);
    });
  }

  let files = [];
  if(supplementaryFiles) {
    files = supplementaryFiles.files
  }


  for (let i in files) {
    let supplementaryFile = files[i];
    if (files) {
      let image = storeImage(supplementaryFile, hexCode, supplementaryFilesDir, 'supplementary-files');
      updatedSupplementaryFiles.push({
        name: supplementaryFile.name,
        image,
      });
    }
  }
  return updatedSupplementaryFiles;
}

const extractTopics = (topicsField) => {
  const selectedLabels = topicsField?.value.map(val => {
    const option = topicsField.field.options.find(opt => opt.value.trim() === val.trim());
    return option ? option.label.trim() : null;
  }).filter(label => label !== null);

  return selectedLabels?.join(', ');
}

const getHeaderInfo = (submissionWithFields, article) => {
  let submission = JSON.parse(submissionWithFields);

  if (!submission) {
    submission = [];
  }

  const topicsField = submission.find(sub => sub.field.name === 'submission.topics');
  const doiField = submission.find(sub => sub.field.name === 'submission.doi');
  const authorField = submission.find(sub => sub.field.name === 'submission.authorNames');
  const publishDateField = article.publishedDate;
	// This change gets the title field to work correctly. BUT: this function generally seems to fail
	// at present because what's being passed as submissionWithFields (article.submissionWithFields) seems
	// to be undefined with the rearrangement of metadata.
  const titleField = submission.find(sub => sub.field.name === 'submission.$title') || {value: JSON.parse(article.submission)['$title']};
	const topics = extractTopics(topicsField);

  return {
    topics,
    DOI: doiField?.value,
    authorNames: authorField?.value,
    publishedOn: publishDateField,
    title: titleField?.value || `Manuscript #${article.shortId}`
  };
};

const getMetaData = (submissionWithFields, article) => {
  const fieldsToRemove = ["submission.topics", "submission.doi", "submission.authorNames", "meta.title"];
  const parsedSubmissionField = JSON.parse(submissionWithFields);
  const filteredMetaData = parsedSubmissionField.filter(field => !fieldsToRemove.includes(field.field.name));
  return filteredMetaData;
}

const getTotalRecords = async group => {
  try {
    const initData = await getAllTheArticles(group, 1, 0);
    if (!initData || initData.length < 1) {
      return 0;
    }
    return initData[0].totalCount;
  } catch (error) {
    console.error("Error getting total records:", error);
    return 0;
  }
};

const getAllTheQueryPromises = async (group, limit) => {
  try {
    const totalRecords = await getTotalRecords(group);
    const offsetLimit = Math.floor(totalRecords / limit);
    const promises = [];

    for (let i = 0; i <= offsetLimit; i++) {
      promises.push(getAllTheArticles(group, limit, i * limit));
    }

    return promises;
  } catch (error) {
    console.error("Error getting query promises:", error);
    return [];
  }
};

const syncData = async (group) => {
  try {
    const limit = 10;
    const promises = await getAllTheQueryPromises(group, limit);

    console.log("Triggered all the queries.");
    const results = await Promise.all(promises);
    console.log("Processed all the queries.");

    const allArticles = results.flat();

    const dataFile = `${getGroupDataDir(group)}/articleQuery.json`;
    fs.writeFileSync(dataFile, JSON.stringify({ articles: allArticles }), "utf8");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

module.exports = { syncData };