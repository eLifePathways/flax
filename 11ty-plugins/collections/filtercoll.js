module.exports = function(eleventyConfig, options) {
  eleventyConfig.addFilter("where", function(coll, key, value) {
    return coll.filter(function(entry) {
      return entry[key].trim().toLowerCase() == value.trim().toLowerCase();
    });
  });
}
