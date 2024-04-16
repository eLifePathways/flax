const { setupAllGroups, setupGroup } = require("../setup");
const { getCMSLayout } = require('../queries')
const { getGroupById } = require("../groups");
const { deleteAllSubDirectories } = require("../helpers");

const rebuild = async (req, res) => {
	let groupId = req.body.groupId;
	let buildConfigs = req.body.buildConfigs ? req.body.buildConfigs : {};
	let updatedConfig = req.body.updatedConfig;
	buildConfigs.updatedConfig = updatedConfig ? updatedConfig : false;
	let group = await getGroupById(groupId);
	const cmsLayout = await getCMSLayout(group)

	await setupGroup(group, cmsLayout, buildConfigs);
	return res.status(200).json({ message: "Flax site rebuilt successfully." });
};

const createGroup = async (req, res) => {
	const groupId = req.body.group;
	const group = await getGroupById(groupId);
	const cmsLayout = await getCMSLayout(group)

	await setupGroup(group, cmsLayout, { force: true, build: true });
	return res
		.status(200)
		.json({ message: `${group.name} created successfully. !!` });
};

const rebuildGroup = async (req, res) => {
	const groupId = req.body.group;
	const group = await getGroupById(groupId);
	const cmsLayout = await getCMSLayout(group)

	await setupGroup(group, cmsLayout, { build: true });
	return res
		.status(200)
		.json({ message: `${group.name} rebuild successfully. !!` });
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

const setupSiteForGroups = async () => {
	await setupAllGroups({ shouldBuild: true, force: true });
};

module.exports = {
	rebuild,
	createGroup,
	rebuildGroup,
	deleteGroup,
	setupSiteForGroups,
};