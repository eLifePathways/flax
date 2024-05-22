const rimraf = require("rimraf");
const fs = require("fs");
const path = require("path");
var https = require("https");
var http = require("http");
const axios = require("axios");

const getGroupAssetDir = (group, hexCode, appendStr) => {
	const dataFolderPath = path.join(__dirname, `public/${group.name}${hexCode ? '/' + hexCode : ''}/assets`);
	return appendStr ? `${dataFolderPath}/${appendStr}` : dataFolderPath;
};

const getGroupDataDir = (group, hexCode, appendStr) => {
	const dataFolderPath = path.join(__dirname, `src/${group.name}${hexCode ? '/' + hexCode : ''}/data`);
	return appendStr ? `${dataFolderPath}/${appendStr}` : dataFolderPath;
};

const getGroupSrcDir = (group, hexCode) => {
	return path.join(__dirname, `src/${group.name}`, hexCode || '');
};

const getGroupLayoutDir = (group, hexCode, appendStr) => {
	const baseLayoutUrl = path.join(__dirname, `src/${group.name}`, hexCode || '');
	return appendStr ? `${baseLayoutUrl}/${appendStr}` : baseLayoutUrl;
};

const getGroupPublicDir = (group, hexCode) => {
	return path.join(__dirname, `public/${group.name}${hexCode ? '/' + hexCode : ''}`);
};

const imageFileLocalUrl = (hexCode, appendStr) => {
	const baseImagesUrl = `${hexCode ? '/' + hexCode : ''}/assets/images`;
	return appendStr ? `${baseImagesUrl}/${appendStr}` : baseImagesUrl;
};

const deleteAllSubDirectories = async (directoryPath) => {
	rimraf.sync(directoryPath);

	console.log(`${directoryPath} deleted successfully!`);
};

const copyFolder = async (sourceDir, destinationDir) => {
	if (!fs.existsSync(destinationDir)) {
		fs.mkdirSync(destinationDir);
	}

	const files = fs.readdirSync(sourceDir);
	for (const file of files) {
		const currentSrc = `${sourceDir}/${file}`;
		const currentDest = `${destinationDir}/${file}`;
		if (fs.lstatSync(currentSrc).isDirectory()) {
			copyFolder(currentSrc, currentDest);
		} else {
			fs.copyFileSync(currentSrc, currentDest);
		}
	}
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

const deleteLocalFile = (localPath) => {
  try {
		fs.rmSync(localPath)
	} catch {
		// Do nothing
	}
};

const storeImage = (file, hexCode, directory, folderName) => {
	if (!isValidFile(file)) {
		return "";
	}

	let originalImage = file.storedObjects.find(
		(storedObject) => storedObject.type === "original"
	);
	let imageFullPath = `${directory}/${file.name}`;
	let imageLocalUrl = imageFileLocalUrl(hexCode, `${folderName}/${file.name}`);

	downloadFile(originalImage.url, imageFullPath);

	return {
		imageFullPath,
		imageLocalUrl,
	};
};

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


const downloadAndSaveFile = async (url, fileName) => {
	const response = await axios({
	  url,
	  method: 'GET',
	  responseType: 'stream',
	});

	const writer = fs.createWriteStream(fileName);
  
	return new Promise((resolve, reject) => {
	  response.data.pipe(writer);
	  writer.on('finish', resolve);
	  writer.on('error', reject);
	});
}
  


const rebuildSite = (group, hexCode) => {
	const { exec } = require("child_process");
	let command = `npx eleventy --pathprefix=${group.name} --input=src/${group.name}${hexCode ? '/' + hexCode : ''} --output=public/${group.name}${hexCode ? '/' + hexCode : ''}`;
	console.log({ command, status: "rebuilding site" });
	return new Promise((resolve, reject) => {
		exec(command, (error, output) => (error ? reject(error) : resolve(output)));
	});
};

const copyArticleTemplate = (article, group, hexCode) => {
	try {
		// update article template file
		const templateFile = `${getGroupLayoutDir(group, hexCode, 'layouts/article-preview.njk')}`
  		fs.writeFileSync(templateFile, article, 'utf8');
	} catch (err) {
  		console.error('Error writing to file:', err);
	}
}

const getSubDirectories = async (parentDir) => {
	return new Promise((resolve, reject) => {
		fs.readdir(parentDir, async (err, files) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(files);
			return;
		});
	});
};

const updateFlaxSiteConfigFile = async (group, hexCode, updatedConfig) => {
	const configFilePath = getGroupDataDir(group, hexCode, "cmsConfig.json");
	const config = require(configFilePath);
	let newConfig = { ...config, ...updatedConfig };
	fs.writeFileSync(configFilePath, JSON.stringify(newConfig), "utf8");
};

const updateFlaxSiteFile = (group, hexCode) => {
	const siteFilePath = getGroupDataDir(group, hexCode, "site.json");
	const site = require(siteFilePath);
	site.name = `${group.name} `;
	const updatedSite = { ...site }
	fs.writeFileSync(siteFilePath, JSON.stringify(updatedSite), "utf8");
};

const authenticate = async (req, res, next) => {
	const clientId = process.env.SERVICE_FLAX_SITE_CLIENT_ID;
	const clientSecret = process.env.SERVICE_FLAX_SITE_SECRET;

	if (!clientId || !clientSecret) {
		return next();
	}
	const basic = req.headers.authorization.split(" ");
	const decodedToken = Buffer.from(basic[1], "base64").toString();
	const tokenParams = decodedToken.split(":");
	const reqClientId = tokenParams[0];
	const reqClientSecret = tokenParams[1];
	const isAuthenticated =
		reqClientId === clientId && reqClientSecret === clientSecret;

	if (isAuthenticated) {
		return next();
	}

	throw new Error("Unauthorize request");
};

module.exports = {
	copyFolder,
	deleteAllSubDirectories,
	downloadAndSaveFile,
	getGroupDataDir,
	getGroupAssetDir,
	rebuildSite,
	copyArticleTemplate,
	authenticate,
	storeImage,
	isValidFile,
	getSubDirectories,
	updateFlaxSiteConfigFile,
	getGroupSrcDir,
	getGroupPublicDir,
	downloadFile,
	deleteLocalFile,
	updateFlaxSiteFile,
	imageFileLocalUrl,
};