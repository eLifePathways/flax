const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginTOC = require('eleventy-plugin-nesting-toc')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const { DateTime } = require('luxon')
const cheerio = require('cheerio')

const fg = require('fast-glob')
const rimraf = require("rimraf");
const flaxPlugins = require("./11ty-plugins/flax-plugins.js");

const deleteDirectories = require("./SiteHelpers/deleteDirectories.js")

module.exports = function (eleventyConfig) {
  // passthrough file copy //

  eleventyConfig.addPassthroughCopy(
    { "static/": "assets/" },
    {
      expand: true,
    }
  );


  // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.setServerOptions({
    watch: ["public/**/*.css", "static/**/*.css"],
  });

  // flaxhelpers
  eleventyConfig.addPlugin(flaxPlugins);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // Clean the output directory before each build
  eleventyConfig.on("beforeBuild", () => {
    deleteDirectories("public", "assets")
    // rimraf.sync("public");
  });

  
  eleventyConfig.addCollection('supplementaryFiles', function (collection) {
      return supplementary
  })
    
  // plugin TOC
  eleventyConfig.addPlugin(pluginTOC)
  
  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    }).use(markdownItAnchor, {})
  )

  // add link to the diverses files
  const supplementary = fg.sync([
    '**/outputs/**',
    '!**/node_modules/',
    '!**/temp',
    '!**/public',
  ])

  eleventyConfig.addFilter('reorderPages', function (pages) {
    return pages.sort((page1, page2) => {
      if (page1.sequenceIndex > page2.sequenceIndex) return 1
      else if (page1.sequenceIndex < page2.sequenceIndex) return -1
      else return 0
    })
  })

  eleventyConfig.addFilter('valueOrDefault', function (value, defaultValue) {
    if(!value) {
      return defaultValue
    }
    return value
  })

  // get the date with luxon (for all date)
  eleventyConfig.addFilter('postDate', (dateObj) => {
    let date = new Date(dateObj)
    return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)
  })

  eleventyConfig.addFilter('addIDtoTitles', function (value) {
    const $ = cheerio.load(`${value}`)

    $('h2,h3,h4,h5').each(function (i, elem) {
      $(this).attr('id', $(this).text().toLowerCase().replace(/\s/g, ''))
    })

    return $.html()
  })

  eleventyConfig.addFilter('cleanLink', function (value) {
    let regex = new RegExp('')
    return value.replace(/static\/outputs\/\d+?\//, '')
  })

  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3', 'h4'], // which heading tags are selected headings must each have an ID attribute
    wrapper: 'nav', // element to put around the root `ol`/`ul`
    wrapperClass: 'toc', // class for the element around the root `ol`/`ul`
    ul: false, // if to use `ul` instead of `ol`
    flat: false,
  })
  

  // folder structures
  // -----------------------------------------------------------------------------
  // content, data and layouts comes from the src folders
  // output goes to public (for gitlab ci/cd)
  // -----------------------------------------------------------------------------
  return {
    markdownTemplateEngine: "njk",
    
    dir: {
      input: 'src',
      output: 'public',
      includes: 'layouts',
      data: 'data',
    },
  }
}
