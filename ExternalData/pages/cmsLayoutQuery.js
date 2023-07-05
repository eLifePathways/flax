var https = require("https");
var http = require("http");
const fs = require("fs");
const { makeAPICall } = require("../../api");
const dataFile = `src/data/cmsLayout.json`;
const partnerDirectoryPath = "public/assets/images/partners/";
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
};

const storePartnerImage = (partnerFile) => {
	if (!isValidFile(partnerFile)) {
		return "";
	}

	let originalImage = partnerFile.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);
	let imageFullPath = `${partnerDirectoryPath}${originalImage.key}`;
	let imageLocalUrl = `${partnerFilePath}${originalImage.key}`;

	downloadFile(originalImage.url, imageFullPath);

	return {
		imageFullPath,
		imageLocalUrl,
	};
};

const storePartners = async (partners) => {
	let updatedPartnersData = [];
	if (!fs.existsSync(partnerDirectoryPath)) {
		fs.mkdir(partnerDirectoryPath, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log("Directory created successfully!");
		});
	}
	for (let i in partners) {
		let partner = partners[i];
		let image = storePartnerImage(partner.file);
		partner.file = "";
		updatedPartnersData.push({
			...partner,
			image,
		});
	}
	return updatedPartnersData;
};

const storeLogoFile = async (logo) => {
	if (!isValidFile(logo)) {
		return "";
	}

	let originalImage = logo.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);

	downloadFile(originalImage.url, `public/assets/images/logo.png`);
};

const getLayoutInfo = async () => {
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
					menu
					url
				}
				flaxFooterConfig {
					title
					sequenceIndex
					menu
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

	let response = await makeAPICall({ graphQLQuery });
	if (!response) {
		return false;
	}
	let cmsLayout = response.cmsLayout;
	storeLogoFile(cmsLayout.logo);
	cmsLayout.partners = await storePartners(cmsLayout.partners);
	return cmsLayout;
};

const syncData = async () => {
	let data = await getLayoutInfo();
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};

syncData();
module.exports = { syncData };
