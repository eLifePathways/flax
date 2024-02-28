const { makeAPICall } = require("../../api");
const { getGroupDataDir } = require("../../helpers");
const { imagesHandler } = require("../../SiteHelpers/fileHandler.js");
const { getCmsPages, getCMSLayout } = require('../../queries')
const fs = require("fs");

const getPages = async (group) => {
	const cmsPages = await getCmsPages(group);
	return {
		pages: cmsPages,
	};
};

const splitPagesByLangs = (data, cmsLayout) => {
  const splitPages = { pages: [] };
	const mainLanguage = cmsLayout.languages[0]
  for (const page of data.pages) {
    for (const lang of cmsLayout.languages) {
      const title = page.title[lang] || page.title[mainLanguage];
      const content = page.content[lang] || page.content[mainLanguage];
			let url = page.url;
			if(cmsLayout.languages.length > 1)
    		url = `${lang}/${url}`;

      splitPages.pages.push({ ...page, title, content, url });
    }
  }

  return splitPages;
}

const syncData = async (group) => {
	const dataFile = getGroupDataDir(group) + "/cmsPages.json";
	let data = await getPages(group);
	const cmsLayout = await getCMSLayout(group);
	// if(cmsLayout.languages.length > 1)
		data = splitPagesByLangs(data, cmsLayout);
	if (data) {
		fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
	}
};
module.exports = { syncData };