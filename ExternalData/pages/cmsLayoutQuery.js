const fs = require("fs");
const {
	getGroupAssetDir,
	getGroupDataDir,
	downloadFile,
	storeImage,
	isValidFile,
} = require("../../helpers");
const { getCMSLayout } = require('../../queries')

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

const storeLogoFile = async (logo, groupAssetDir) => {
	if (!isValidFile(logo)) {
		return "";
	}

	let originalImage = logo.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);

	downloadFile(originalImage.url, groupAssetDir + "logo.png");
};

const storeFaviconFile = async (favicon, groupAssetDir) => {
	if (!isValidFile(favicon)) {
		return "";
	}

	let originalImage = favicon.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);

	downloadFile(originalImage.url, groupAssetDir + "favicon.png");
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

const getLayoutInfo = async (group) => {
	const cmsLayout = await getCMSLayout(group)
	const { hexCode } = cmsLayout
	cmsLayout.flaxHeaderConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxHeaderConfig, cmsLayout.hexCode
	);

	cmsLayout.flaxFooterConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxFooterConfig, cmsLayout.hexCode
	);

	cmsLayout.publishConfig = cmsLayout.publishConfig ? JSON.parse(cmsLayout.publishConfig) : {}

	const groupAssetDir = getGroupAssetDir(group, hexCode, "images/")
	await storeLogoFile(cmsLayout.logo, groupAssetDir);
	await storeFaviconFile(cmsLayout.favicon, groupAssetDir)
	cmsLayout.partners = await storePartners(group, hexCode, cmsLayout.partners);
	return cmsLayout;
};

const syncData = async (group) => {
	const dataFile = getGroupDataDir(group) + "/cmsLayout.json";
	let data = await getLayoutInfo(group);
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };