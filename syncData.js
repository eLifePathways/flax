const fs = require("fs");
const path = require("path");

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

const syncAllData = async (group, attrs = {}) => {
	if (!group) {
		console.warn("No group found");
		return false;
	}

	const promises = [];
	const dirPath = "./ExternalData";
	const jsFiles = getFilesFromDirectory(dirPath);

	for (let i in jsFiles) {
		const filePath = `./${jsFiles[i]}`;
		const scriptModule = require(filePath);
		promises.push(scriptModule.syncData(group));
		console.log("Sync started for file: " + filePath);
	}
	await Promise.all(promises);
	console.log("Sync completed for files ", jsFiles);

	return true;
};

module.exports = syncAllData;