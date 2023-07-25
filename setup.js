const { deleteAllSubDirectories, copyFolder } = require("./helpers");
const fs = require("fs");
const parentDir = "./src";

const setupGroupSite = async (group) => {
	const directoryPath = `src/${group.name}`;
	const groupName = group.name;
	const defaultGroup = "kotahi";
	const defaultPath = `src/${defaultGroup}`;
	const groupPath = `src/${groupName}`;

	if (groupName === defaultGroup) {
		return true;
	}

	return new Promise((resolve, reject) => {
		fs.readdir(parentDir, async (err, files) => {
			if (err) {
				reject(err);
				return;
			}
			if (files.includes(groupName)) {
				await deleteAllSubDirectories(directoryPath);
			}
			await copyFolder(defaultPath, groupPath);

			resolve(files);
			return;
		});
	});
};

const setupWithAllGroups = async (groups) => {
	for (const group of groups) {
		setupGroupSite(group);
	}
};

module.exports = {
	setupGroupSite,
	setupWithAllGroups,
};
