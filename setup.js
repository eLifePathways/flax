const fs = require("fs");
const {
	deleteAllSubDirectories,
	rebuildSite,
	getGroupSrcDir,
	updateFlaxSiteConfigFile,
	getGroupPublicDir,
	updateFlaxSiteFile,
	downloadAndSaveFile,
} = require("./helpers");

const syncAllData = require("./syncData");
const { getGroups } = require("./groups");
const { getCMSLayout, getActiveCmsFilesTree } = require("./queries");
// const DEFAULT_GROUP = { id: "", name: "kotahi" };

// const setupGroupDirectory = async (group, hexCode) => {
// 	const currentGroupDir = getGroupSrcDir(group);
// 	const defaultGroupDir = getGroupSrcDir(DEFAULT_GROUP);
// 	if (currentGroupDir == defaultGroupDir) {
// 		return true;
// 	}

// 	const updatedConfig = {
// 		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
// 		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
// 		group,
// 	}

// 	await deleteAllSubDirectories(currentGroupDir);
// 	await copyFolder(defaultGroupDir, currentGroupDir);
// 	await updateFlaxSiteConfigFile(group, updatedConfig);
// 	await setupSiteFlag(group);
// 	return true;
// };

const reCreateFileStructure= async (files, parentFolder ) => {
	const folderName = parentFolder + '/' + files.name;

	if (files.fileId === null) {
		fs.mkdirSync(folderName);
	}

	if (files.children && files.children.length > 0) {
	  for (const child of files.children) {
		await reCreateFileStructure(child, folderName);
	  }
	}
	
	if (files.fileId && files.url) {
	  await downloadAndSaveFile(files.url, folderName)
		.then(() => console.log(`File ${folderName} downloaded and saved successfully.`))
		.catch(error => console.error(`Error downloading file ${folderName}: ${error.message}`));
	}
}

const setupDirectoryFromUrl = async (group, hexCode) => {
	const currentGroupDir = getGroupSrcDir(group);

	const updatedConfig = {
		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
		group,
	}

	await deleteAllSubDirectories(currentGroupDir);

	fs.mkdirSync(currentGroupDir);

	const files = await getActiveCmsFilesTree(group)

	const parsedFiles = JSON.parse(files.getActiveCmsFilesTree)

	for (const child of parsedFiles.children) {
		await reCreateFileStructure(child, getGroupSrcDir(group, hexCode));
	}

	await updateFlaxSiteConfigFile(group, updatedConfig);
	await setupSiteFlag(group);
	return true;
};

const setupGroup = async (currentGroup, hexCode, buildConfig) => {
	const publicDir = getGroupPublicDir(currentGroup, hexCode);
	const currentGroupDir = getGroupSrcDir(currentGroup, hexCode);
	const updatedConfig = {
		group: currentGroup,
		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
		...buildConfig.updatedConfig,
	}

	await setupDirectoryFromUrl(currentGroup, hexCode)

	await updateFlaxSiteConfigFile(currentGroup, updatedConfig);

	if (buildConfig.build != false) {
		if (!fs.existsSync(publicDir)) {
			await rebuildSite(currentGroup, hexCode);
		}

		await syncAllData(currentGroup, buildConfig);

		if (fs.existsSync(publicDir)) {
			await rebuildSite(currentGroup, hexCode);
			await syncAllData(currentGroup, buildConfig);
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
	let promises = [];
	for (const group of groups) {
		const cmsLayout = await getCMSLayout(group)
		const { hexCode } = cmsLayout

		promises.push(setupGroup(group, hexCode, { build: true }));
	}
	let results = await Promise.all(promises);
	return results;
};

module.exports = {
	setupAllGroups,
	setupGroup,
};