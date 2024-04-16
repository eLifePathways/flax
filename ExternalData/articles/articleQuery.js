const fs = require("fs");
const { getArticles } = require('../../queries')
const { getGroupDataDir, getGroupAssetDir, storeImage } = require("../../helpers");

/** Generate a submission object containing only publishable data.
 * That is, for fields with publishing set to 'always',
 * or set to 'ad-hoc' and manually chosen for publishing.
 */
const getPublishableSubmissionObject = submissionWithFields => {
  const result = {}
  submissionWithFields
    .filter(entry => entry.shouldPublish && entry.fieldName.startsWith('submission.'))
    .forEach(entry => {
      const submissionFieldName = entry.fieldName.split('submission.')[1]
      result[submissionFieldName] = entry.value
    })
  return result
}

const getChunkOfArticles = async (group, cmsLayout, limit, offset) => {
  const articles = await getArticles(group, limit, offset)
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

      const publishableSubmission = getPublishableSubmissionObject(article.submissionWithFields)

      return {
        parsedSubmission,
        ...article,
        articleMetadata: { submission: publishableSubmission },
        reviews,
        decisions,
        metaData,
        headerInfo,
        supplementaryFiles
      };
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
  const doiField = submission.find(sub => sub.field.name === 'submission.$doi');
  const authorField = submission.find(sub => sub.field.name === 'submission.$authors');
  const publishDateField = article.publishedDate;
  const titleField = submission.find(sub => sub.field.name === 'submission.$title');
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
  const fieldsToRemove = ["submission.topics", "submission.$doi", "submission.$authors", "submission.$title"];
  const parsedSubmissionField = JSON.parse(submissionWithFields);
  const filteredMetaData = (parsedSubmissionField || []).filter(field => !fieldsToRemove.includes(field.field.name));
  return filteredMetaData;
}

const getAllArticles = async (group, cmsLayout, chunkSize) => {
  try {
    let totalRecordsCount = Number.POSITIVE_INFINITY
    let offset = 0

    const allArticles = []
    while (offset < totalRecordsCount) {
      const result = await getChunkOfArticles(group, cmsLayout, chunkSize, offset)
      if (!result.length) break;
      allArticles.push(...result)
      totalRecordsCount = result[0].totalLength
      offset += chunkSize
    }

    console.log(`Retrieved ${allArticles.length} articles for group ${group.name}`)

    return allArticles;
  } catch (error) {
    console.error("Error retrieving articles:", error);
    return [];
  }
};

const syncData = async (group, cmsLayout) => {
  try {
    const chunkSize = 10;
    const allArticles = await getAllArticles(group, cmsLayout, chunkSize);
    const dataFile = `${getGroupDataDir(group)}/articleQuery.json`;
    fs.writeFileSync(dataFile, JSON.stringify({ articles: allArticles }), "utf8");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

module.exports = { syncData };
