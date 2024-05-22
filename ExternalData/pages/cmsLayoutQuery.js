const fs = require("fs/promises");
const {
	getGroupAssetDir,
	getGroupDataDir,
	downloadFile,
	deleteLocalFile,
	storeImage,
	isValidFile,
} = require("../../helpers");

const exists = async path => {
	try{
		await fs.access(path)
		return true
	} catch {
		return false
	}
}

const storePartners = async (group, hexCode, partners) => {
	const partnersDir = getGroupAssetDir(group, hexCode, "images/partners");
	let updatedPartnersData = [];

	if (!(await exists(partnersDir))) {
		try {
			await fs.mkdir(partnersDir, { recursive: true })
			console.log(`Directory created successfully!`);
		} catch (err) {
			console.error(err);
		}
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

	if (cmsLayout.logo)
		await storeGroupwideFile(cmsLayout.logo, groupAssetDir, 'logo.png');
	else {
		try {
			await fs.copyFile('static/images/placeholders/logo.png', `${groupAssetDir}logo.png`)
		} catch (err) {
			console.warn('Unable to copy placeholder logo into position.')
		}
	}

	await storeGroupwideFile(cmsLayout.favicon, groupAssetDir, 'favicon.png')
	cmsLayout.partners = await storePartners(group, hexCode, cmsLayout.partners);
	return cmsLayout;
};

const syncData = async (group, cmsLayout) => {
	const dataFile = getGroupDataDir(group, cmsLayout.hexCode) + "/cmsLayout.json";
	let data = await getLayoutInfo(group, cmsLayout);
	if (data) {
		await fs.writeFile(dataFile, JSON.stringify(data), "utf8");
	}
};

module.exports = { syncData };