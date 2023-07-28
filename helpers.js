const rimraf = require("rimraf");
const fs = require("fs");
const path = require("path");
var https = require("https");
var http = require("http");

const getGroupAssetDir = (group, appendStr) => {
	const dataFolderPath = path.join(__dirname, `public/${group.name}/assets`);
	return appendStr ? `${dataFolderPath}/${appendStr}` : dataFolderPath;
};

const getGroupDataDir = (group, appendStr) => {
	const dataFolderPath = path.join(__dirname, `src/${group.name}/data`);
	return appendStr ? `${dataFolderPath}/${appendStr}` : dataFolderPath;
};

const getGroupSrcDir = (group) => {
	return path.join(__dirname, `src/${group.name}`);
};

const getGroupPublicDir = (group) => {
	return path.join(__dirname, `public/${group.name}`);
};

const imageFileLocalUrl = (appendStr) => {
	const baseImagesUrl = "/assets/images";
	return appendStr ? `${baseImagesUrl}/${appendStr}` : dataFolderPath;
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

const rebuildSite = (group) => {
	const { exec } = require("child_process");
	let command = `npx eleventy --pathprefix=${group.name} --input=src/${group.name} --output=public/${group.name}`;
	console.log({ command, status: "rebuilding site" });
	return new Promise((resolve, reject) => {
		exec(command, (error, output) => (error ? reject(error) : resolve(output)));
	});
};

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

const updateFlaxSiteConfigFile = (group, updatedConfig) => {
	const configFilePath = getGroupDataDir(group, "config.json");
	const config = require(configFilePath);
	let newConfig = { ...config, ...updatedConfig };
	fs.writeFileSync(configFilePath, JSON.stringify(newConfig), "utf8");
};

const updateFlaxSiteFile = group => { 
	const siteFilePath = getGroupDataDir(group, "site.json");
	const site = require(siteFilePath);
	site.name = `${group.name}`;
	const updatedSite = {...site}
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
	deleteAllSubDirectories,
	copyFolder,
	getGroupDataDir,
	getGroupAssetDir,
	rebuildSite,
	authenticate,
	getSubDirectories,
	updateFlaxSiteConfigFile,
	getGroupSrcDir,
	getGroupPublicDir,
	downloadFile,
	updateFlaxSiteFile,
	imageFileLocalUrl,
};
