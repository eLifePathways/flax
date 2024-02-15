const fs = require("fs");
const {
	getGroupAssetDir,
	getGroupDataDir,
	downloadFile,
	deleteLocalFile,
	storeImage,
	isValidFile,
} = require("../../helpers");

const storePartners = async (group, hexCode, partners) => {
	const partnersDir = getGroupAssetDir(group, hexCode, "images/partners");
	let updatedPartnersData = [];

	if (!fs.existsSync(partnersDir)) {
		fs.mkdir(partnersDir, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log(`Directory created successfully!`);
		});
	}

	for (let i in partners) {
		let partner = partners[i];
		if (partner.file) {
			let image = storeImage(partner.file, hexCode, partnersDir, 'partners');
			partner.file = "";
			updatedPartnersData.push({
				...partner,
				image,
			});
		}
	}
	return updatedPartnersData;
};

const storeGroupwideFile = async (file, groupAssetDir, fileName) => {
	const localPath = groupAssetDir + fileName;
	if (!isValidFile(file)) {
		deleteLocalFile(localPath)
		return "";
	}

	let originalImage = file.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);

	downloadFile(originalImage.url, localPath);
};

const fixUrlsForHeaderAndFooter = (flaxHeaderConfigs, hexCode) => {
	updatedHeaderConfig = [];
	for (let i in flaxHeaderConfigs) {
		let flaxHeaderConfig = flaxHeaderConfigs[i];
		let url = flaxHeaderConfig.url.startsWith("/")
			? flaxHeaderConfig.url
			: "/" + flaxHeaderConfig.url;
		updatedHeaderConfig.push({
			...flaxHeaderConfig,
			url: `${hexCode ? '/' + hexCode : ''}${url}`,
		});
	}

	return updatedHeaderConfig;
};

const getLayoutInfo = async (group, cmsLayout) => {
	const { hexCode } = cmsLayout
	cmsLayout.flaxHeaderConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxHeaderConfig, cmsLayout.hexCode
	);

	cmsLayout.flaxFooterConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxFooterConfig, cmsLayout.hexCode
	);

	const groupAssetDir = getGroupAssetDir(group, hexCode, "images/")
	await storeGroupwideFile(cmsLayout.logo, groupAssetDir, 'logo.png');
	await storeGroupwideFile(cmsLayout.favicon, groupAssetDir, 'favicon.png')
	cmsLayout.partners = await storePartners(group, hexCode, cmsLayout.partners);
	return cmsLayout;
};

const syncData = async (group, cmsLayout) => {
	const dataFile = getGroupDataDir(group) + "/cmsLayout.json";
	let data = await getLayoutInfo(group, cmsLayout);
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};

module.exports = { syncData };