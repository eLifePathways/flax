const fs = require("fs");
const { makeAPICall } = require("../../api");
const { getGroupDataDir } = require("../../helpers");

const getAllTheArticles = async (group) => {
	const graphQLQuery = JSON.stringify({
		query: `query {
      manuscriptsPublishedSinceDate {
        id
        shortId
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
		return false;
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

      return { parsedSubmission, ...article, reviews, decisions };
    }    
  );

	return {
		articles: parsedArticles,
	};
};

const syncData = async (group) => {
	const dataFile = `${getGroupDataDir(group)}/articleQuery.json`;
	let data = await getAllTheArticles(group);

	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};

module.exports = { syncData };