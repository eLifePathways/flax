const fs = require("fs");
const { makeAPICall } = require("../../api");
const { getGroupDataDir } = require("../../helpers");

const getAllTheArticles = async (group) => {
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
		group,
	});

	console.log("Article query responded.");

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

const syncData = async (group) => {
	const dataFile = `${getGroupDataDir(group)}/articleQuery.json`;
	let data = await getAllTheArticles(group);

	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};

module.exports = { syncData };
