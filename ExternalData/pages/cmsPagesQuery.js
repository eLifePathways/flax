const { makeAPICall } = require("../../api");
const fs = require("fs");
const dataFile = `src/data/cmsPages.json`;

const getPages = async () => {
	let graphQLQuery = JSON.stringify({
		query: `query cmsPages {
      cmsPages {
          id
          title
          shortcode
          created
          content
          meta
          menu
          url
          sequenceIndex
      }
    }`,
		variables: {},
	});

	let response = await makeAPICall({ graphQLQuery });
	if (!response) {
		return false;
	}

	let cmsPagesData = response.cmsPages;
	let cmsPages = [];
	for (let i in cmsPagesData) {
		let cmsPage = cmsPagesData[i];
		cmsPages.push(cmsPage);
	}

	return {
		pages: cmsPages,
	};
};

const syncData = async () => {
	let data = await getPages();
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };
