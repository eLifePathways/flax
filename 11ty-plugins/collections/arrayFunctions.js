
const { get } = require("lodash");
module.exports = function (eleventyConfig) {

	eleventyConfig.addFilter("filterArray", function (array, field, value) {
		return array.filter(data => get(data, field) !== value);
	});


	eleventyConfig.addFilter("findElement", function (array, field, value) {
		for (let item of array) {
			if (get(item, field) === value) {
				return item;
			}
		}
		
		return null;
	});

	eleventyConfig.addFilter("arrayToString", function (array, key, trim) {
		if (!array) {
			return "";
		}

		let results = array;
		results = array.map((item) => {
			let newItem = key ? get(item, key) : item;
			return (newItem + "").trim();
		});

		if (!trim) {
			return results.join(", ");
		}

		let trimmedResults = [];
		let uniqueSet = new Set();

		for (let item of results) {
			if (item !== "" && !uniqueSet.has(item)) {
				uniqueSet.add(item);
				trimmedResults.push(item);
			}
		}

		if (!trimmedResults.length > 1) {
			return trimmedResults[0]
		}

		return trimmedResults.join(" - ");
	});
};