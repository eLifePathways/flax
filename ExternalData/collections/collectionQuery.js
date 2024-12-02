const { getGroupDataDir, getGroupAssetDir, downloadFile, imageFileLocalUrl} = require("../../helpers");
const { getCollectionsQuery } = require('../../queries')
const fs = require("fs");

const storeImages = async (group, hexCode, collections) => {
    const collectionImagesDir = getGroupAssetDir(group, hexCode, "images/collections");
	let updatedCollectionsData = [];

	if (!fs.existsSync(collectionImagesDir)) {
		try {
			fs.mkdirSync(collectionImagesDir, { recursive: true })
			console.log(`Collection Directory created successfully!`);
		} catch (err) {
			console.error(err);
		}
	}

	for (let i in collections) {
		let collection = collections[i];

		if (collection.formData.file) {
            let imageFullPath = `${collectionImagesDir}/${collection.formData.file.name}`
	        let imageLocalUrl = imageFileLocalUrl(hexCode, `collections/${collection.formData.file.name}`)
            downloadFile(collection.formData.image, imageFullPath) 
            collection.formData.image = imageLocalUrl
        }

        updatedCollectionsData.push(collection);
	}

	return updatedCollectionsData;
}

const syncData = async (group, cmsLayout) => {
    const { hexCode } = cmsLayout
	const dataFile = getGroupDataDir(group, cmsLayout.hexCode) + "/cmsCollections.json";
	let data = await getCollectionsQuery(group)

    collections = await storeImages(group, hexCode, data.publishingCollection)

	collections.map(collection => {
		collection.manuscripts = collection.manuscripts.map(manuscript => {	
			const parsedSubmission = JSON.parse(manuscript.submission);
			return {
				...manuscript,
				parsedSubmission
			}
		})
		return collection
	});

	if (collections.length) {
		fs.writeFileSync(dataFile, JSON.stringify({ collections }), "utf8");
	}
};

module.exports = { syncData };