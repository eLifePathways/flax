const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const {
	getGroupAssetDir,
	imageFileLocalUrl,
	downloadFile,
} = require("../helpers");

const stringIsAValidUrl = (s) => {
	try {
		new URL(s);
		return true;
	} catch (err) {
		return false;
	}
};

const getDirPathToSaveTheImages = (group, folderName) => {
	return getGroupAssetDir(group, `/images/${folderName}`);
};

const getDirPathToSaveTheFile = group => {
	return getGroupAssetDir(group, `/files`);
};

const setImageAttrs = (img, imgSrc) => {
	img.removeAttribute("data-low-def");
	img.removeAttribute("data-standard-def");
	img.removeAttribute("data-hi-def");
	img.src = imgSrc;
	return img;
};

const setFiles = (file, group) => {
	const url = file.storedObjects[0].url
	const dirPath = getDirPathToSaveTheFile(group);
	const fileName = file.name

	downloadFile(url, `${dirPath}/${fileName}`);
	return fileName;
}

const downloadAndSetImagePath = (img, imageId, dirPath, folderName) => {
	let fileName = `${imageId}-${img.alt}`;
	downloadFile(img.src, `${dirPath}/${fileName}`);
	let ImageUrl = imageFileLocalUrl(`/${folderName}/${fileName}`);
	setImageAttrs(img, ImageUrl);
};

const imagesHandler = (group, folderName, content, id) => {
	let dirPath = getDirPathToSaveTheImages(group, folderName);
	let imageId = id ? id : (Math.random() + 1).toString(36).substring(5);
	if (!fs.existsSync(dirPath)) {
		fs.mkdir(dirPath, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log("Directory created successfully!");
		});
	}

	const contentDom = new JSDOM(content);
	let document = contentDom.window.document;
	document.body.querySelectorAll("img").forEach((img) => {
		if (stringIsAValidUrl(img.src)) {
			downloadAndSetImagePath(img, imageId, dirPath, folderName);
		}
	});
	return contentDom.serialize();
};

module.exports = {
	imagesHandler,
	setFiles
}