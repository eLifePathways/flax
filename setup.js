const fs = require("fs");
const {
	deleteAllSubDirectories,
	rebuildSite,
	copyFolder,
	getGroupSrcDir,
	updateFlaxSiteConfigFile,
	getGroupPublicDir,
} = require("./helpers");

const syncAllData = require("./syncData");
const { getGroups } = require("./groups");
const DEFAULT_GROUP = { id: "", name: "kotahi" };

const setupGroupDirectory = async (group) => {
	const currentGroupDir = getGroupSrcDir(group);
	const defaultGroupDir = getGroupSrcDir(DEFAULT_GROUP);
	if (currentGroupDir == defaultGroupDir) {
		return true;
	}

	await deleteAllSubDirectories(currentGroupDir);
	await copyFolder(defaultGroupDir, currentGroupDir);
	await updateFlaxSiteConfigFile(group, { group });
	return true;
};

const setupGroup = async (currentGroup, buildConfig) => {
	const publicDir = getGroupPublicDir(currentGroup);
	const currentGroupDir = getGroupSrcDir(currentGroup);

	if (!fs.existsSync(currentGroupDir) || buildConfig.force == true) {
		await setupGroupDirectory(currentGroup, buildConfig);
	}

	if (buildConfig.updatedConfig) {
		await updateFlaxSiteConfigFile(currentGroup, buildConfig.updatedConfig);
	}

	if (buildConfig.build != false) {
		if (!fs.existsSync(publicDir)) {
			await rebuildSite(currentGroup);
		}

		await syncAllData(currentGroup, buildConfig);
		await rebuildSite(currentGroup);
	}
};

const setupForAllGroups = async () => {
	const groups = await getGroups();
	if (!groups) {
		console.warn("No groups found.");
		return;
	}
	let promises = [];
	for (const group of groups) {
		promises.push(setupGroup(group, { build: true }));
	}
	let results = await Promise.all(promises);
	return results;
};

module.exports = {
	setupForAllGroups,
	setupGroup,
};
