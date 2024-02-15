const fs = require("fs");
const {
	deleteAllSubDirectories,
	rebuildSite,
	copyFolder,
	getGroupSrcDir,
	updateFlaxSiteConfigFile,
	getGroupPublicDir,
	updateFlaxSiteFile,
	copyArticleTemplate,
} = require("./helpers");

const syncAllData = require("./syncData");
const { getGroups } = require("./groups");
const { getCMSLayout } = require("./queries");
const DEFAULT_GROUP = { id: "", name: "kotahi" };

const setupGroupDirectory = async (group, hexCode) => {
	const currentGroupDir = getGroupSrcDir(group);
	const defaultGroupDir = getGroupSrcDir(DEFAULT_GROUP);
	if (currentGroupDir == defaultGroupDir) {
		return true;
	}

	const updatedConfig = {
		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
		group,
	}

	await deleteAllSubDirectories(currentGroupDir);
	await copyFolder(defaultGroupDir, currentGroupDir);
	await updateFlaxSiteConfigFile(group, updatedConfig);
	await setupSiteFlag(group);
	return true;
};

const setupGroup = async (currentGroup, hexCode, article, cmsLayout, buildConfig) => {
	const publicDir = getGroupPublicDir(currentGroup, hexCode);
	const currentGroupDir = getGroupSrcDir(currentGroup, hexCode);
	const updatedConfig = {
		group: currentGroup,
		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
		...buildConfig.updatedConfig,
	}

	if (!fs.existsSync(currentGroupDir) || buildConfig.force == true) {
		await setupGroupDirectory(currentGroup, hexCode);
	}

	if (article !== '') {
		await copyArticleTemplate(article, currentGroup, hexCode)
	}

	await updateFlaxSiteConfigFile(currentGroup, updatedConfig);

	if (buildConfig.build != false) {
		if (!fs.existsSync(publicDir)) {
			await rebuildSite(currentGroup, hexCode);
		}

		await syncAllData(currentGroup, cmsLayout, buildConfig);

		// TODO Why are we repeating this?
		if (fs.existsSync(publicDir)) {
			await rebuildSite(currentGroup, hexCode);
			await syncAllData(currentGroup, cmsLayout, buildConfig);
		}
	}
};

const setupSiteFlag = async group => {
	return updateFlaxSiteFile(group);
}

const setupAllGroups = async () => {
	const groups = await getGroups();
	if (!groups) {
		console.warn("No groups found.");
		return;
	}
	let results = [];
	for (const group of groups) {
		const cmsLayout = await getCMSLayout(group)
		const { hexCode, article } = cmsLayout

		results.push(await setupGroup(group, hexCode, article, cmsLayout, { build: true }));
	}
	return results;
};

module.exports = {
	setupAllGroups,
	setupGroup,
};