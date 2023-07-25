const { setupGroupSite } = require("../setup");
const fs = require("fs");
const config = require("../src/kotahi/data/config");
const { getGroupById } = require("../groups");
const {
	rebuildSite,
	rebuildSiteCallback,
	deleteAllSubDirectories,
} = require("../helpers");
const syncAllData = require("../syncData");

const updateConfigurations = (updatedConfig, group) => {
	let currentConfig = config;
	let newConfig = { ...currentConfig, ...updatedConfig };
	fs.writeFile(
		`./src/${group}/data/config`,
		JSON.stringify(newConfig),
		"utf8",
		(err) => {
			if (err) {
				console.error(err);
				return;
			}
		}
	);
};

const rebuild = async (req, res) => {
	let updatedConfig = req.body.updatedConfig;
	let groupId = req.body.groupId;
	let buildConfigs = req.body.buildConfigs ? req.body.buildConfigs : {};
	let group = await getGroupById(groupId);

	await setupGroupSite(group);
	if (updatedConfig) {
		updateConfigurations(updatedConfig, group.name);
	}

	rebuildSite(group, async (error) => {
		await syncAllData(buildConfigs, group);
		rebuildSite(group, (error) => rebuildSiteCallback(error, res, group));
	});
};

const createGroup = async (req, res) => {
	const group = req.body.group;
	await setupGroupSite(group);
	return res
		.status(200)
		.json({ message: `${group.name} created successfully. !!` });
};

const syncDataForGroup = async (req, res) => {
	const group = req.body.group;
	let updatedConfig = req.body.updatedConfig;
	let buildConfigs = req.body.buildConfigs ? req.body.buildConfigs : {};

	if (updatedConfig) {
		updateConfigurations(updatedConfig, groupName);
	}

	await syncAllData(buildConfigs, group);

	return res
		.status(200)
		.json({ message: `Data synced for group ${group.name}` });
};

const rebuildGroup = (req, res) => {
	const group = req.body.group;
	rebuildSite(group, (error) => rebuildSiteCallback(error, res, group));
};

const deleteGroup = async (req, res) => {
	const groupName = req.body.group.name;
	const directoriesToDelete = [`./src/${groupName}`, `./public/${groupName}`];
	for (const directoryPath of directoriesToDelete) {
		await deleteAllSubDirectories(directoryPath);
	}
	return res
		.status(200)
		.json({ message: `Group ${groupName} deleted successfully.` });
};

module.exports = {
	rebuild,
	createGroup,
	syncDataForGroup,
	rebuildGroup,
	deleteGroup,
};
