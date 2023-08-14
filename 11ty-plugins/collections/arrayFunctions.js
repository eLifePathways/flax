module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter("arrayToString", function (array, key, trim) {
		if (!array) {
			return "";
		}

		let results = array;
		results = array.map((item) => {
			let newItem = key ? item[key] : item;
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