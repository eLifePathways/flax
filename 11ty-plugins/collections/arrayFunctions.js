module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter("arrayToString", function (array, key) {
		if (!array) {
			return "";
		}

		let results = array;
		results = array.map((item) => {
			let newItem = key ? item[key] : item;
			return (newItem + "").trim();
		});

		return results.join(", ");
	});
};
