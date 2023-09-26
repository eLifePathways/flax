const limitData = require("./collections/limitData.js");
const dateWrangler = require("./collections/dateWrangler.js");
const markdownifying = require("./collections/markdownify.js");
const reorderBlock = require("./collections/reorderBlock.js");
const dejats = require("./collections/dejats.js");
const groupby = require("./collections/groupby.js");
const arrayFunctions = require("./collections/arrayFunctions.js");
const makeSvgsFromLatex = require("./collections/makeSvgsFromLatex.js");

module.exports = function (eleventyConfig) {
	// filters
	eleventyConfig.addPlugin(limitData);
	eleventyConfig.addPlugin(dateWrangler);
	eleventyConfig.addPlugin(markdownifying);
	eleventyConfig.addPlugin(reorderBlock);
	eleventyConfig.addPlugin(dejats);
	eleventyConfig.addPlugin(groupby);
	eleventyConfig.addPlugin(arrayFunctions);
	eleventyConfig.addPlugin(makeSvgsFromLatex);
};
