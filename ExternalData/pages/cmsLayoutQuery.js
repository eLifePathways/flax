var https = require("https");
var http = require("http");
const fs = require("fs");
const { getGroupAssetDir, getGroupDataDir } = require("../../helpers");
const abc = require("../../src/kotahi/data/cmsPages.json");
const { makeAPICall } = require("../../api");
const partnerFilePath = "/assets/images/partners/";

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

const downloadFile = (url, localPath) => {
	try {
		let protocol = url.includes("https") ? https : http;

		protocol
			.get(url, (res) => {
				let isValidUrl = res.statusCode >= 200 && res.statusCode <= 300;
				if (!isValidUrl) {
					return;
				}
				const file = fs.createWriteStream(localPath);
				res.pipe(file);
				file.on("finish", () => file.close());
			})
			.on("error", (err) => console.error(err));
	} catch (err) {
		console.log(err);
	}
};

const storePartnerImage = (partnerFile, partnersDir) => {
	if (!isValidFile(partnerFile)) {
		return "";
	}

	let originalImage = partnerFile.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);
	let imageFullPath = `${partnersDir}${originalImage.key}`;
	let imageLocalUrl = `${partnersDir}${originalImage.key}`;

	downloadFile(originalImage.url, imageFullPath);

	return {
		imageFullPath,
		imageLocalUrl,
	};
};

const storePartners = async (partners, partnersDir) => {
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

	downloadFile(originalImage.url, groupAssetDir + "/images/logo.png");
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

	let response = await makeAPICall({
		graphQLQuery,
		group,
	});
	if (!response) {
		return false;
	}

	let cmsLayout = response.cmsLayout;
	cmsLayout.group = group;
	const groupAssetDir = getGroupAssetDir(group);
	const partnersDir = groupAssetDir + "/images/partners/";

	storeLogoFile(cmsLayout.logo, groupAssetDir);
	cmsLayout.partners = await storePartners(cmsLayout.partners, partnersDir);

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
