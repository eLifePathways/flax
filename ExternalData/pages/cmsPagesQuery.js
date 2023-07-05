const { makeAPICall } = require("../../api");
const fs = require("fs");
const dataFile = `src/data/cmsPages.json`;

const getPages = async () => {
	let graphQLQuery = JSON.stringify({
		query: `query cmsPages {
      cmsPages {
          id
          title
          created
          content
          url
      }
    }`,
		variables: {},
	});

	let response = await makeAPICall({ graphQLQuery });
	if (!response) {
		return false;
	}

	return {
		pages: response.cmsPages,
	};
};

const syncData = async () => {
	let data = await getPages();
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };
