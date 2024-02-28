const fs = require("fs");
const {
	getGroupAssetDir,
	getGroupDataDir,
	getGroupSrcDir,
	downloadFile,
	storeImage,
	isValidFile,
	deleteAllSubDirectories,
	createDirectory,
	createFile,
	getGroupPublicDir
} = require("../../helpers");
const { getCMSLayout } = require('../../queries')

const entryTemplate = fs.readFileSync(__dirname + `/entry.njk`, 'utf8')
const listTemplate = fs.readFileSync(__dirname + `/paginated-list.njk`, 'utf8')

const storePartners = async (group, hexCode, partners) => {
	const partnersDir = getGroupAssetDir(group, hexCode, "images/partners");
	let updatedPartnersData = [];

	if (!fs.existsSync(partnersDir)) {
		fs.mkdir(partnersDir, (err) => {
			if (err) {
				return console.error(err);
			}
			console.log(`Directory created successfully!`);
		});
	}

	for (let i in partners) {
		let partner = partners[i];
		if (partner.file) {
			let image = storeImage(partner.file, hexCode, partnersDir, 'partners');
			partner.file = "";
			updatedPartnersData.push({
				...partner,
				image,
			});
		}
	}
	return updatedPartnersData;
};

const storeLogoFile = async (logoOriginal, groupAssetDir, languagesOriginal) => {
	const logo = JSON.parse(JSON.stringify(logoOriginal));
	const languages = JSON.parse(JSON.stringify(languagesOriginal));
	if(!logo) return

	for (let lang of languages) {
		const mainLanguage = languages[0]
    const image = logo[lang] || logo[mainLanguage];

		if (!isValidFile(image))
			continue;

		const originalImage = image.storedObjects.find(
      (storedObject) => storedObject.type === "original"
    );
		downloadFile(originalImage.url, groupAssetDir + `logo${languages.length > 1 ? lang : ''}.png`);
  }
};

const fixUrlsForHeaderAndFooter = (flaxHeaderConfigs, hexCode) => {
	updatedHeaderConfig = [];
	for (let i in flaxHeaderConfigs) {
		let flaxHeaderConfig = flaxHeaderConfigs[i];
		let url = flaxHeaderConfig.url.startsWith("/")
			? flaxHeaderConfig.url
			: "/" + flaxHeaderConfig.url;
		updatedHeaderConfig.push({
			...flaxHeaderConfig,
			url: `${hexCode ? '/' + hexCode : ''}${url}`,
		});
	}

	return updatedHeaderConfig;
};

const getLayoutInfo = async (group) => {
	const cmsLayout = await getCMSLayout(group)
	const { hexCode } = cmsLayout
	cmsLayout.flaxHeaderConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxHeaderConfig, cmsLayout.hexCode
	);

	cmsLayout.flaxFooterConfig = fixUrlsForHeaderAndFooter(
		cmsLayout.flaxFooterConfig, cmsLayout.hexCode
	);

	cmsLayout.publishConfig = cmsLayout.publishConfig ? JSON.parse(cmsLayout.publishConfig) : {}

	
	await storeLogoFile(cmsLayout.logo, getGroupAssetDir(group, hexCode, "images/"), cmsLayout.languages);

	cmsLayout.partners = await storePartners(group, hexCode, cmsLayout.partners);
	return cmsLayout;
};

const replaceIndexTemplateWithLanguage = (template, language) => {
	return template.replace("{{language}}", language)
}


const valueOrValueFromFirstLang = (value, languages, mainLanguage) => {
	const newValue = {...value}

	if(languages.length > 1){
		for(const lang of languages){
			if(newValue[lang] === undefined) newValue[lang] = newValue[mainLanguage] || newValue[Object.keys(newValue)[0]]
		}
	}

	return newValue
}

const fillEmptyCmsLayoutValues = (data) => {
	const cmsLayout = {...data}
	const mainLanguage = cmsLayout.languages[0]


	cmsLayout.primaryColor = valueOrValueFromFirstLang(cmsLayout.primaryColor, cmsLayout.languages, mainLanguage)
	cmsLayout.secondaryColor = valueOrValueFromFirstLang(cmsLayout.secondaryColor, cmsLayout.languages, mainLanguage)
	cmsLayout.footerText = valueOrValueFromFirstLang(cmsLayout.footerText, cmsLayout.languages, mainLanguage)

	for(let [index, headerConfig] of cmsLayout.flaxHeaderConfig.entries()){
		const config = valueOrValueFromFirstLang(headerConfig.config, cmsLayout.languages, mainLanguage)
		const headerTitle = valueOrValueFromFirstLang(headerConfig.title, cmsLayout.languages, mainLanguage)

		cmsLayout.flaxHeaderConfig[index].config = config
		cmsLayout.flaxHeaderConfig[index].title = headerTitle
	}

	for(let [index, footerConfig] of cmsLayout.flaxFooterConfig.entries()){
		const config = valueOrValueFromFirstLang(footerConfig.config, cmsLayout.languages, mainLanguage)
		const footerTitle = valueOrValueFromFirstLang(footerConfig.title, cmsLayout.languages, mainLanguage)

		cmsLayout.flaxFooterConfig[index].config = config
		cmsLayout.flaxFooterConfig[index].title = footerTitle
	}

	return cmsLayout;
}

const syncData = async (group) => {
	const dataFile = getGroupDataDir(group) + "/cmsLayout.json";
	let data = await getLayoutInfo(group);

	const groupSrcDir = getGroupSrcDir(group)
	const groupPublicDir = getGroupPublicDir(group)
	//clean previous languages from group src folder
	const prevCmsLayout = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
	if(prevCmsLayout && prevCmsLayout.languages){
		for(const lang of prevCmsLayout.languages){
			await deleteAllSubDirectories(groupSrcDir + '/' + lang);
			await deleteAllSubDirectories(groupPublicDir + '/' + lang);
		}
	}
	//create new languages in group src folder
	if(data.languages && data.languages.length > 1){
		for(const lang of data.languages){
			const langPath = groupSrcDir + '/' + lang
			const articlesPath = langPath + '/articles'
			await createDirectory(langPath);
			await createDirectory(articlesPath);
			await createFile(articlesPath + '/entry.njk', replaceIndexTemplateWithLanguage(entryTemplate, lang));
			await createFile(articlesPath + '/paginated-list.njk', replaceIndexTemplateWithLanguage(listTemplate, lang));
		}
	}

	data = fillEmptyCmsLayoutValues(data)

	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };