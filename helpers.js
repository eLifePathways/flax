const rimraf = require("rimraf");
const fs = require("fs");
const path = require('path');

const getGroupAssetDir = group => `public/${group.name}/assets`; 

const getGroupDataDir = group => {
	const dataFolderPath = path.join(__dirname, `src/${group.name}/data`);
	return dataFolderPath;
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

const rebuildSite = (group, callback) => {
  const { exec } = require("child_process");
  let command = `npx eleventy --pathprefix=${group.name} --input=src/${group.name} --output=public/${group.name}`;
  console.log({ command, status: "rebuilding site" });
  exec(command, callback);
};


const rebuildSiteCallback = (error, res, group) => {
  if (error) {
    console.error(`Error rebuilding Eleventy app: ${error.message}`);
    return res
      .status(500)
      .json({ error: `Failed to rebuild the app for ${group.name}` });
  }
  return res.status(200).json({ message: "Flax site rebuilt successfully." });
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
	rebuildSiteCallback,
	authenticate,
};
