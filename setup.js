const fs = require("fs");
const {
	deleteAllSubDirectories,
	rebuildSite,
	copyFolder,
	getGroupSrcDir,
	updateFlaxSiteConfigFile,
	getGroupPublicDir,
	downloadAndSaveFile,
	updateFlaxSiteFile,
} = require("./helpers");

const syncAllData = require("./syncData");
const { getGroups } = require("./groups");
const { getCMSLayout, getActiveCmsFilesTree } = require("./queries");
const DEFAULT_GROUP = { id: "", name: "kotahi" };

const reCreateFileStructure= async (files, parentFolder ) => {
	const entityName = parentFolder + '/' + files.name;

	if (files.fileId === null) {
		fs.mkdirSync(entityName, { recursive: true });
	}

	if (files.children && files.children.length > 0) {
	  for (const child of files.children) {
		await reCreateFileStructure(child, entityName);
	  }
	}
	
	if (files.fileId && files.url) {
	  await downloadAndSaveFile(files.url, entityName)
		.then(() => console.log(`File ${entityName} downloaded and saved successfully.`))
		.catch(error => console.error(`Error downloading file ${entityName}: ${error.message}`));
	}
}

const setupDirectoryFromUrl = async (group, hexCode) => {
	if (hexCode) {
		// Eleventy doesn't reliably delete a non-draft group that it has previously built.
		// So we force its deletion.
		await deleteAllSubDirectories(`public/${group.name}`)
	}

	const currentGroupDir = getGroupSrcDir(group);
	await deleteAllSubDirectories(currentGroupDir);
	fs.mkdirSync(currentGroupDir, { recursive: true });

	const updatedConfig = {
		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
		group,
	}


	const files = await getActiveCmsFilesTree(group)

	const parsedFiles = JSON.parse(files.getActiveCmsFilesTree)

	for (const child of parsedFiles.children) {
		await reCreateFileStructure(child, getGroupSrcDir(group, hexCode));
	}

	// await copyFolder(defaultGroupDir, currentGroupDir);
	await updateFlaxSiteConfigFile(group, hexCode, updatedConfig);
	await setupSiteFlag(group, hexCode);
	return true;
}

const setupGroup = async (currentGroup, cmsLayout, buildConfig) => {
	const { hexCode } = cmsLayout

	const publicDir = getGroupPublicDir(currentGroup, hexCode);
	const currentGroupDir = getGroupSrcDir(currentGroup, hexCode);
	const updatedConfig = {
		group: currentGroup,
		defaultImagesDirectory: `${hexCode ? '/' + hexCode : ''}/assets/images/`,
		defaultArticleDirectory: `${hexCode ? '/' + hexCode : ''}/articles/`,
		...buildConfig.updatedConfig,
	}

	await setupDirectoryFromUrl(currentGroup, hexCode)

	await updateFlaxSiteConfigFile(currentGroup, hexCode, updatedConfig);

	if (buildConfig.build != false) {
		if (!fs.existsSync(publicDir)) {
			try {
				await rebuildSite(currentGroup, hexCode);
			} catch (err) {
				console.log(err);
			}
		}

		await syncAllData(currentGroup, cmsLayout, buildConfig);

		// TODO Why are we repeating this?
		if (fs.existsSync(publicDir)) {
			try {
				await rebuildSite(currentGroup, hexCode);
				await syncAllData(currentGroup, cmsLayout, buildConfig);
			} catch (err) {
				console.log(err)
			}
		}
	}
};

const setupSiteFlag = async (group, hexCode) => {
	return updateFlaxSiteFile(group, hexCode);
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

		results.push(await setupGroup(group, cmsLayout, { build: true }));
	}
	return results;
};

module.exports = {
	setupAllGroups,
	setupGroup,
};