const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const {
	getGroupAssetDir,
	imageFileLocalUrl,
	supplementaryFileLocalUrl,
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

const getDirPathToSaveSupplementary = (group, hexCode, folderName) => {
	return getGroupAssetDir(group, hexCode, `supplementary-files/${folderName}`);
};

const getDirPathToSaveTheImages = (group, hexCode, folderName) => {
	return getGroupAssetDir(group, hexCode, `images/${folderName}`);
};

const setImageAttrs = (img, imgSrc) => {
	img.removeAttribute("data-low-def");
	img.removeAttribute("data-standard-def");
	img.removeAttribute("data-hi-def");
	img.src = imgSrc;
	return img;
};

const setFileAttrs = (a, aHref) => {
	a.href = aHref;
	return a;
};

const downloadAndSetFilePath = (a, id, dirPath, folderName, hexCode) => {
	let fileName = `${id}-${a.title}`;
	downloadFile(a.href, `${dirPath}/${fileName}`);
	let fileUrl = supplementaryFileLocalUrl(hexCode, `${folderName}/${fileName}`);
	setFileAttrs(a, fileUrl);
};

const downloadAndSetImagePath = (img, imageId, dirPath, folderName, hexCode) => {
	let fileName = `${imageId}-${img.alt}`;
	downloadFile(img.src, `${dirPath}/${fileName}`);
	let ImageUrl = imageFileLocalUrl(hexCode, `${folderName}/${fileName}`);
	setImageAttrs(img, ImageUrl);
};

const imagesHandler = (group, folderName, content, id, hexCode) => {
	let dirPath = getDirPathToSaveTheImages(group, hexCode, folderName);
	let imageId = id ? id : (Math.random() + 1).toString(36).substring(5);
	if (!fs.existsSync(dirPath)) {
		try {
			fs.mkdirSync(dirPath, { recursive: true })
			console.log("Directory created successfully!");
		} catch (err) {
			return console.error(err);
		}
	}

	const contentDom = new JSDOM(content);
	let document = contentDom.window.document;
	document.body.querySelectorAll("img").forEach((img) => {
		if (stringIsAValidUrl(img.src)) {
			downloadAndSetImagePath(img, imageId, dirPath, folderName, hexCode);
		}
	});
	return contentDom.serialize();
};

const linkHandler = (group, folderName, content, id, hexCode) => {
	let dirPath = getDirPathToSaveSupplementary(group, hexCode, folderName);
	let fileId = id ? id : (Math.random() + 1).toString(36).substring(5);

	if (!fs.existsSync(dirPath)) {
		try {
			fs.mkdirSync(dirPath, { recursive: true })
			console.log("Directory created successfully!");
		} catch (err) {
			return console.error(err);
		}
	}

	const contentDom = new JSDOM(content);
	let document = contentDom.window.document;
	document.body.querySelectorAll("a").forEach((a) => {
		if (stringIsAValidUrl(a.href)) {
			downloadAndSetFilePath(a, fileId, dirPath, folderName, hexCode);
		}
	});
	return contentDom.serialize();
};

module.exports = {
	imagesHandler,
	linkHandler,
}