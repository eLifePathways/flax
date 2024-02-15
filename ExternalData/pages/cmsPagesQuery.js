const { getGroupDataDir } = require("../../helpers");
const { getCmsPages } = require('../../queries')
const fs = require("fs");

const getPages = async (group) => {
	const cmsPages = await getCmsPages(group);
	return {
		pages: cmsPages,
	};
};

const syncData = async (group, cmsLayout) => {
	const dataFile = getGroupDataDir(group) + "/cmsPages.json";
	let data = await getPages(group);
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };