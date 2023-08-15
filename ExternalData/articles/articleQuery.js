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
        submissionWithFields
        submission
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
    (article) => {

      const parsedSubmission = JSON.parse(article.submission);

      const reviews = article.reviews?.map((review) => ({
        ...review,
        jsonData: JSON.parse(review.jsonData),
      })) || [];

      const decisions = article.decisions?.map((decision) => ({
        ...decision,
        jsonData: JSON.parse(decision.jsonData),
      })) || [];

      const headerInfo = getHeaderInfo(article.submissionWithFields, article);

      return { parsedSubmission, ...article, reviews, decisions, headerInfo };
    }    
  );

	return parsedArticles
};

const getHeaderInfo = (submissionWithFields, article) => {
  const parsedSubmissionWithFields =  JSON.parse(submissionWithFields)
  let headerInfo = {}
  headerInfo.topics = parsedSubmissionWithFields.topics
  headerInfo.DOI = parsedSubmissionWithFields.doi?.value
  headerInfo.authorNames = parsedSubmissionWithFields.authorNames?.value
  headerInfo.publishedOn = article.publishedDate
  headerInfo.title = article.meta?.title

  return headerInfo;
}

const getTotalRecords = async (group) => {
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
    
    const allArticles = results.flat(); // Use flat() to merge nested arrays
    
    const dataFile = `${getGroupDataDir(group)}/articleQuery.json`;
    fs.writeFileSync(dataFile, JSON.stringify({ articles: allArticles }), "utf8");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

module.exports = { syncData };