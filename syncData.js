const fs = require("fs");
const path = require("path");

const {syncData: syncArticles} = require('./ExternalData/articles/articleQuery')
const {syncData: syncCollections} = require('./ExternalData/collections/collectionQuery')
const {syncData: syncLayout} = require('./ExternalData/pages/cmsLayoutQuery')
const {syncData: syncPages} = require('./ExternalData/pages/cmsPagesQuery')

const getFilesFromDirectory = (dirPath) => {
	const files = [];
	fs.readdirSync(dirPath).forEach((file) => {
		const filePath = path.join(dirPath, file);
		if (fs.statSync(filePath).isDirectory()) {
			const nestedFiles = getFilesFromDirectory(filePath);
			files.push(...nestedFiles);
		} else if (file.endsWith(".js")) {
			files.push(filePath);
		}
	});

	return files;
};

const syncAllData = async (group, cmsLayout, attrs = {}) => {
	if (!group) {
		console.warn("No group found");
		return false;
	}

	console.log("Starting sync");
	await Promise.all([
		syncArticles(group, cmsLayout),
		syncCollections(group, cmsLayout),
		syncLayout(group, cmsLayout),
		syncPages(group, cmsLayout)
	]);
	console.log("Sync completed");

	return true;
};

module.exports = syncAllData;