const { makeAPICall } = require("../../api");
const { getGroupDataDir } = require("../../helpers");
const { imagesHandler } = require("../../SiteHelpers/fileHandler.js");
const { getCmsPages } = require('../../queries')
const fs = require("fs");

const getPages = async (group) => {
	const cmsPages = await getCmsPages(group);
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