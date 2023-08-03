const fs = require("fs");
const {
	getGroupAssetDir,
	getGroupDataDir,
	downloadFile,
	imageFileLocalUrl,
} = require("../../helpers");
const { makeAPICall } = require("../../api");

const isValidFile = (file) => {
	if (!file || !file.storedObjects) {
		return false;
	}

	let originalImage = file.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);

	if (!originalImage) {
		return false;
	}

	return true;
};

const storePartnerImage = (partnerFile, partnersDir) => {
	if (!isValidFile(partnerFile)) {
		return "";
	}

	let originalImage = partnerFile.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);
	let imageFullPath = `${partnersDir}${originalImage.key}`;
	let imageLocalUrl = imageFileLocalUrl(`/partners/${originalImage.key}`);

	downloadFile(originalImage.url, imageFullPath);

	return {
		imageFullPath,
		imageLocalUrl,
	};
};

const storePartners = async (group, partners) => {
	const partnersDir = getGroupAssetDir(group, "/images/partners/");
	let updatedPartnersData = [];

	if (!fs.existsSync(partnersDir)) {
		fs.mkdir(partnersDir, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log("Directory created successfully!");
		});
	}

	for (let i in partners) {
		let partner = partners[i];
		let image = storePartnerImage(partner.file, partnersDir);
		partner.file = "";
		updatedPartnersData.push({
			...partner,
			image,
		});
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

const fixUrlsForHeaderAndFooter = (flaxHeaderConfigs) => {
	updatedHeaderConfig = [];
	for (let i in flaxHeaderConfigs) {
		let flaxHeaderConfig = flaxHeaderConfigs[i];
		let url = flaxHeaderConfig.url.startsWith("/")
			? flaxHeaderConfig.url
			: "/" + flaxHeaderConfig.url;
		updatedHeaderConfig.push({
			...flaxHeaderConfig,
			url,
		});
	}

	return updatedHeaderConfig;
};

const getLayoutInfo = async (group) => {
	let graphQLQuery = JSON.stringify({
		query: `
		query cmsLayout {
      		cmsLayout {
				primaryColor
				secondaryColor
				footerText
				flaxHeaderConfig {
					title
					sequenceIndex
					shownInMenu
					url
				}
				flaxFooterConfig {
					title
					sequenceIndex
					shownInMenu
					url
				}
				partners {
					url
					sequenceIndex
					file {
						name
						storedObjects {
							mimetype
							key
							url
							type
						}
					}
				}
				logo {
					id
					name
					storedObjects {
						mimetype
						key
						url
						type
					}
				}
      	}
    }`,
		variables: {},
	});

	let response = await makeAPICall({ graphQLQuery, group });
	if (!response) {
		return false;
	}

	let cmsLayout = response.cmsLayout;
	cmsLayout.flaxHeaderConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxHeaderConfig
	);

	cmsLayout.flaxFooterConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxFooterConfig
	);

	storeLogoFile(cmsLayout.logo, getGroupAssetDir(group, "/images/"));
	cmsLayout.partners = await storePartners(group, cmsLayout.partners);
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
