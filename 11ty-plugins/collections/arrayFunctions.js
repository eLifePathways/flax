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

	eleventyConfig.addFilter('getTopics', function (topics) {

		let labels = [];
		if (!(topics && topics.value)) {
			return;
		}

		for (const value of topics.value) {
			const option = topics.structure.options.find(option => option.value === value);
			if (option) {
				labels.push(option.label);
			} else {
				labels.push(value);
			}
		}

		return labels.join(', ')
	});
};