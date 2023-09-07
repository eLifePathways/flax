const fs = require("fs");
const { makeAPICall } = require("../../api");
const { getGroupDataDir } = require("../../helpers");

const getAllTheArticles = async (group, limit, offset) => {
  const graphQLQuery = JSON.stringify({
    query: `query {
      manuscriptsPublishedSinceDate(limit: ${limit}, offset: ${offset}) {
        id
        shortId
        totalCount
        files {
          id
          name
          alt
          caption
          tags
          objectId
          storedObjects {
            type
            key
            size
            mimetype
            extension
            imageMetadata {
              width
              height
              space
              density
            }
            url
          }
          uploadStatus
          inUse
        }
        reviews {
          id
          jsonData
          user{
            id
            username
          }
        }
        decisions {
          id
          jsonData
          user{
            id
            username
          }
        }
        editors {
          name
          role
        }
        status
        meta {
          title
          source
          abstract
        }
        submission
        supplementaryFiles
        submissionWithFields
        publishedDate
        printReadyPdfUrl
        styledHtml
        css
        }
      }
    `,
    variables: {},
  });

  let response = await makeAPICall({
    graphQLQuery,
    group,
  });

  console.log("Article query responded.");

  if (!response) {
    return [];
  }


  const parsedArticles = response.manuscriptsPublishedSinceDate.map(
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

      const supplementaryFiles = JSON.parse(article.supplementaryFiles)
      const headerInfo = getHeaderInfo(article.submissionWithFields, article);
      const metaData = getMetaData(article.submissionWithFields, article)
      article.submissionWithFields = JSON.parse(article.submissionWithFields)

      return { parsedSubmission, ...article, reviews, decisions, metaData, headerInfo, supplementaryFiles };
    }
  );

  return parsedArticles
};

const extractTopics = (topicsField) => {
  const selectedLabels = topicsField?.value.map(val => {
    const option = topicsField.field.options.find(opt => opt.value.trim() === val.trim());
    return option ? option.label.trim() : null;
  }).filter(label => label !== null);

  return selectedLabels?.join(', ');
}

const getHeaderInfo = (submissionWithFields, article) => {
  let submission = JSON.parse(submissionWithFields);

  if(!submission) {
    submission = [];
  }

  const topicsField = submission.find(sub => sub.field.name === 'submission.topics');
  const doiField = submission.find(sub => sub.field.name === 'submission.doi');
  const authorField = submission.find(sub => sub.field.name === 'submission.authorNames');
  const publishDateField = article.publishedDate;
  const titleField = submission.find(sub => sub.field.name === 'meta.title');
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
  const fieldsToRemove = [ "submission.topics", "submission.doi", "submission.authorNames", "meta.title" ];
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