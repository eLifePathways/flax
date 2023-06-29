const fs = require("fs");
const { makeAPICall } = require("../../api");
const GRAPHQL_URL = "https://kotahidev.cloud68.co/graphql/";
const dataFile = `src/data/articleQuery.json`;

const getAllTheArticles = async () => {
	const graphQLQuery = JSON.stringify({
		query: `query {
      manuscriptsPublishedSinceDate(limit: 10) {
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
		updatedRequestData: { url: GRAPHQL_URL },
	});

	console.log({ response });
	if (!response) {
		return false;
	}

	const parsedArticles = response.manuscriptsPublishedSinceDate.map(
		(article) => {
			return { parsedSubmission: JSON.parse(article.submission), ...article };
		}
	);

	return {
		articles: parsedArticles,
	};
};

const syncData = async () => {
	let data = await getAllTheArticles();
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};

module.exports = { syncData };
