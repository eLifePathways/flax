const { makeAPICall } = require("../../api");
const { getGroupDataDir } = require("../../helpers");
const {imagesHandler} = require("../../SiteHelpers/fileHandler.js");
const fs = require("fs");

const handleImages = (group, cmsPages) => {
	let results = [];
	for (let i in cmsPages) {
		let cmsPage = cmsPages[i];
		cmsPage.content = imagesHandler(group,"cmsPages",cmsPage.content,cmsPage.id);
		results.push(cmsPage);
	}

	return results;
};

const getPages = async (group) => {
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
	});

	let response = await makeAPICall({
		graphQLQuery,
		group,
	});

	if (!response) {
		return false;
	}

	const cmsPages = handleImages(group, response.cmsPages);

	return {
		pages: cmsPages,
	};
};

const syncData = async (group) => {
	const dataFile = getGroupDataDir(group) + "/cmsPages.json";
	let data = await getPages(group);
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };
