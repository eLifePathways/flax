const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginTOC = require("eleventy-plugin-nesting-toc");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const { DateTime } = require("luxon");
const cheerio = require("cheerio");
const fg = require("fast-glob");
const flaxPlugins = require("./11ty-plugins/flax-plugins.js");
const i18n = require('eleventy-plugin-i18n');

const deleteDirectories = require("./SiteHelpers/deleteDirectories.js");
const { imagesHandler } = require("./SiteHelpers/fileHandler.js");
const fs = require('fs');


const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
const translations = require('./src/i18n/index.js');



const intersectArrays = (arr1, arr2) => {
	return arr1.filter(value => arr2.map(value => value.toLowerCase()).includes(value.toLowerCase()));
}

module.exports = function (eleventyConfig) {
	// passthrough file copy //

	eleventyConfig.addPassthroughCopy(
		{ "static/": "assets/" },
		{
			expand: true,
		}
	);

	eleventyConfig.setServerOptions({
		watch: ["public/**/*.css", "static/**/*.css", "public/**/*.js", "static/**/*.js"],
	});

	// flaxHelpers
	eleventyConfig.addPlugin(flaxPlugins);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// Clean the output directory before each build
	eleventyConfig.on("beforeBuild", (options) => {
		const outputDir = options.inputDir.replace("src", "public");
		deleteDirectories(outputDir, "assets");
	});

	eleventyConfig.addCollection("supplementaryFiles", function (collection) {
		return supplementary;
	});

	//plugin i18n
  eleventyConfig.addPlugin(i18n, {
    translations,
    fallbackLocales: {
      '*': 'en'
    },
  });


	// plugin TOC
	eleventyConfig.addPlugin(pluginTOC);

	eleventyConfig.setLibrary(
		"md",
		markdownIt({
			html: true,
			linkify: true,
			typographer: true,
		}).use(markdownItAnchor, {})
	);

	// add link to the diverses files
	const supplementary = fg.sync([
		"**/outputs/**",
		"!**/node_modules/",
		"!**/temp",
		"!**/public",
	]);
	eleventyConfig.addFilter("reorderPages", function (pages, locale = undefined, page = null) {
		if(page){
			const group = page.outputPath.split('/')[1].toLowerCase();
			const cmsLayout = JSON.parse(fs.readFileSync(`./src/${group}/data/cmsLayout.json`, 'utf8'));
			const languages = cmsLayout.languages;
			const mainLanguage = languages[0];
			const sortLanguage = locale || mainLanguage;
			return pages.sort((page1, page2) => {
				if (page1.config[sortLanguage].sequenceIndex > page2.config[sortLanguage].sequenceIndex) return 1;
				else if (page1.config[sortLanguage].sequenceIndex < page2.config[sortLanguage].sequenceIndex) return -1;
				else return 0;
			});
		}
		return pages.sort((page1, page2) => {
			if (page1.sequenceIndex > page2.sequenceIndex) return 1;
			else if (page1.sequenceIndex < page2.sequenceIndex) return -1;
			else return 0;
		});
	});


	eleventyConfig.addNunjucksGlobal("getLocale", (page) => {

		const group = page.outputPath.split('/')[1].toLowerCase();
		const cmsLayout = JSON.parse(fs.readFileSync(`./src/${group}/data/cmsLayout.json`, 'utf8'));
		const languages = cmsLayout.languages;
		
		if(languages.length == 1) return languages[0]

		if(!page.url) return languages[0];

		const pathSegments = page.url.split('/').filter(segment => segment !== '');
		const intersect = intersectArrays(pathSegments, languages);
		if(!intersect.length) return languages[0];

		const localeIndex = languages.map(lang => lang.toLowerCase()).indexOf(intersect[0].toLowerCase());
		if(localeIndex != -1) return languages[localeIndex];
		return languages[0];
	});

	eleventyConfig.addNunjucksGlobal("getLocaleUrl", (page) => {
		const group = page.outputPath.split('/')[1].toLowerCase();
		const cmsLayout = JSON.parse(fs.readFileSync(`./src/${group}/data/cmsLayout.json`, 'utf8'));
		const languages = cmsLayout.languages;

		if(languages.length == 1) return ``

		if(!page.url) return `/${languages[0]}`;

		const pathSegments = page.url.split('/').filter(segment => segment !== '');
		const intersect = intersectArrays(pathSegments, languages);
		if(!intersect.length) return `/${languages[0]}`;

		const localeIndex = languages.map(lang => lang.toLowerCase()).indexOf(intersect[0].toLowerCase());
		if(localeIndex != -1) return `/${languages[localeIndex]}`;
		return `/${languages[0]}`;
	});


	eleventyConfig.addFilter("valueOrDefault", function (value, defaultValue) {
		if (!value) {
			return defaultValue;
		}
		return value;
	});

	// get the date with luxon (for all date)
	eleventyConfig.addFilter("postDate", (dateObj) => {
		let date = new Date(dateObj);
		return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);
	});

	eleventyConfig.addFilter("toLowerCase", (string) => {
		return string.toLowerCase();
	})

	eleventyConfig.addFilter("imagesHandler",
		function (content, id, folderName, group, hexCode) {
			return imagesHandler(group, folderName, content, id, hexCode);
		}
	);

	eleventyConfig.addFilter("addIDtoTitles", function (value) {
		const $ = cheerio.load(`${value}`);

		$("h2,h3,h4,h5").each(function (i, elem) {
			let selector = $(this).text().toLowerCase().replace(/[\s\.\/\W\d]+/g, "");
			$(this).attr("id", selector);
		});

		return $.html();
	});

	eleventyConfig.addFilter("cleanLink", function (value) {
		return value.replace(/static\/outputs\/\d+?\//, "");
	});

	eleventyConfig.addFilter("dumpObject", function (value) {
		return "items";
	});

	eleventyConfig.addFilter("shouldShowEllipses", (pagination, position) => {
		if (pagination.links.length <= 5) {
			return;
		}

		if (position == "start" && pagination.pageNumber + 1 <= 4) {
			return;
		}

		if (position == "end" && pagination.pageNumber + 5 > pagination.links.length) {
			return;
		}

		return "...";
	});

	eleventyConfig.addPlugin(pluginTOC, {
		tags: ["h2", "h3", "h4"], // which heading tags are selected headings must each have an ID attribute
		wrapper: "nav", // element to put around the root `ol`/`ul`
		wrapperClass: "toc", // class for the element around the root `ol`/`ul`
		ul: false, // if to use `ul` instead of `ol`
		flat: false,
	});


	// folder structures
	// -----------------------------------------------------------------------------
	// content, data and layouts comes from the src folders
	// output goes to public (for gitlab ci/cd)
	// -----------------------------------------------------------------------------
	return {
		markdownTemplateEngine: "njk",

		dir: {
			input: "src/kotahi",
			output: "public/kotahi",
			includes: "layouts",
			data: "data",
		},
	};
};