const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var https = require("https");
var http = require("http");

const protocol = (url) => {
	return url.includes("https") ? https : http;
};

const stringIsAValidUrl = (s) => {
	try {
		new URL(s);
		return true;
	} catch (err) {
		return false;
	}
};

const getDirPathToSaveTheFile = (folderName) => {
	let basePath = "./../public/assets/images";
	let pathWithFolder = `${basePath}/${folderName}`;
	return path.join(__dirname, pathWithFolder);
};

const getLocalImageUrl = (folderName, fileName) => {
	let basePath = "/assets/images";
	let localImageUrl = `${basePath}/${folderName}/${fileName}`;
	return localImageUrl;
};

const setImageAttrs = (img, imgSrc) => {
	img.removeAttribute("data-low-def");
	img.removeAttribute("data-standard-def");
	img.removeAttribute("data-hi-def");
	img.src = imgSrc;
	return img;
};

const downloadAndSetImagePath = (img, folderName, dirPath, imageId) => {
	protocol(img.src)
		.get(img.src, (res) => {
			const file = fs.createWriteStream(`${dirPath}/${imageId}-${img.alt}`);
			res.pipe(file);
			file.on("finish", () => {
				file.close();
				console.log(`${img.src} has been downloaded!`);
			});
		})
		.on("error", (err) => {
			console.error(err);
		});

	let ImageUrl = getLocalImageUrl(folderName, `${imageId}-${img.alt}`);
	setImageAttrs(img, ImageUrl);
};

module.exports = (folderName, value, id) => {
	let dirPath = getDirPathToSaveTheFile(folderName);
	let imageId = id ? id : (Math.random() + 1).toString(36).substring(5);
	if (!fs.existsSync(dirPath)) {
		fs.mkdir(dirPath, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log("Directory created successfully!");
		});
	}

	const article = new JSDOM(value);
	let document = article.window.document;
	document.body.querySelectorAll("img").forEach((img) => {
		if (stringIsAValidUrl(img.src)) {
			downloadAndSetImagePath(img, folderName, dirPath, imageId);
		}
	});
	return article.serialize();
};
