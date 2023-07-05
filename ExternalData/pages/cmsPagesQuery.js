const { makeAPICall } = require("../../api");
const fs = require("fs");

const dataFile = `src/data/cmsPages.json`;

const cleanMeta = (cmsPage) => {
	let pageMeta = cmsPage.meta;
	let updatedMeta = {};
	if (!pageMeta) {
		return updatedMeta;
	}
	if (typeof pageMeta != "object") {
		updatedMeta = JSON.parse(pageMeta);
	}
	cmsPage.meta = updatedMeta;
	return updatedMeta;
};

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
	let pageShortCodes = {};
	let cmsPages = [];
	for (let i in cmsPagesData) {
		let cmsPage = cmsPagesData[i];
		cleanMeta(cmsPage);
		pageShortCodes[cmsPage.shortcode] = cmsPage;
		cmsPages.push(cmsPage);
	}

	return {
		shortCodePages: pageShortCodes,
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
