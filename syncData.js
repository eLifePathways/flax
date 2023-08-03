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
	group = {
		name: "kotahi",
		id: "f5f4e600-f234-43c9-85fd-fa321441a504",
	};
	if (!group) {
		console.warn("No group found");
		return false;
	}

	const promises = [];
	const dirPath = "./ExternalData/pages/";
	const jsFiles = getFilesFromDirectory(dirPath);

	for (let i in jsFiles) {
		const filePath = `./${jsFiles[i]}`;
		const scriptModule = require(filePath);
		promises.push(scriptModule.syncData(group));
		console.log("Sync started for file: " + filePath);
	}
	let results = await Promise.all(promises);
	console.log("Sync completed for files ", results);

	return true;
};

syncAllData();
module.exports = syncAllData;
