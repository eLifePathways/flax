
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginTOC = require('eleventy-plugin-nesting-toc')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const { DateTime } = require('luxon')
const cheerio = require('cheerio')
const flatten = require('flat')
const fs = require('fs')
const fg = require('fast-glob')
const rimraf = require("rimraf");
const flaxHelpers = require("./11ty-plugins/flax-helpers.js");

const stringIsAValidUrl = (s) => {
  try {
    new URL(s)
    return true
  } catch (err) {
    return false
  }
}



module.exports = function (eleventyConfig) {
  // eleventyConfig.addPassthroughCopy({ 'static/css': '/css' })
  // eleventyConfig.addPassthroughCopy({ 'static/fonts': '/fonts' })
  // eleventyConfig.addPassthroughCopy({ 'static/js': '/js' })
  // eleventyConfig.addPassthroughCopy({ 'static/images': '/images' })
  // eleventyConfig.addPassthroughCopy({ 'static/outputs': '/outputs' })
  // eleventyConfig.addPassthroughCopy({ 'static/admin': '/admin' })

  // passthrough file copy //
  eleventyConfig.addPassthroughCopy(
    { "static/": "assets/" },
    {
      expand: true,
    }
  );

  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.setServerOptions({
    // to auto reload when css change
    watch: ["public/**/*.css", "static/**/*.css"],
  });

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // flaxhelpers
  eleventyConfig.addPlugin(flaxHelpers);

  // Clean the output directory before each build
  eleventyConfig.on("beforeBuild", () => {
    rimraf.sync("public");
  });

  // collection
  eleventyConfig.addCollection('sortedByOrder', function (collectionApi) {
      return collectionApi.getAll().sort((a, b) => {
        if (a.data.order > b.data.order) return 1
        else if (a.data.order < b.data.order) return -1
        else return 0
      })
  })
  
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

  // limit the amount of items
  eleventyConfig.addFilter('limit', function (arr, limit) {
    return arr.slice(0, limit)
  })

  eleventyConfig.addFilter('filterContent', function (value, el) {
    // console.log(value);
    const $ = cheerio.load(value)
    if ($.html(el)) {
      return (value = $.html(el))
    } else {
      return value
    }
  })

  eleventyConfig.addFilter('addIDtoTitles', function (value) {
    const $ = cheerio.load(`${value}`)

    $('h2,h3,h4,h5').each(function (i, elem) {
      $(this).attr('id', $(this).text().toLowerCase().replace(/\s/g, ''))
    })

    return $.html()
  })

  eleventyConfig.addFilter('showAvailableMeta', function (value) {
    return propertiesToArray(value)
  })

   // useful to use the toc somewhere else
   eleventyConfig.addFilter('prependLinks', function (value, prepend) {
    return value.replace(/<a href="/g, `<a href="${prepend}`)
  })

  eleventyConfig.addFilter('imagesHandler', function (value, id) {

    // if (!fs.existsSync('public/images/articles')) {
    //   fs.mkdir(path.join(__dirname, 'public/images/articles'), (err) => {
    //     if (err) {
    //       return console.error(err)
    //     }
    //     console.log('Directory created successfully!')
    //   })
    // }

    // const article = new JSDOM(value)
    // let document = article.window.document
    // document.body.querySelectorAll('img').forEach((img) => {
    //   //check url first

    //   if (stringIsAValidUrl(img.src)) {
    //     // https
    //     //   .get(img.src, (res) => {
    //     //     const file = fs.createWriteStream(
    //     //       `public/images/articles/art${id}-${img.alt}`
    //     //     )
    //     //     res.pipe(file)
    //     //     file.on('finish', () => {
    //     //       file.close()
    //     //       console.log(`${img.src} has been downloaded!`)
    //     //     })
    //     //   })
    //     //   .on('error', (err) => {
    //     //     console.log(err, res)
    //     //     // console.log('Error: ', err.message)
    //     //   })
    //     // img.removeAttribute('data-low-def')
    //     // img.removeAttribute('data-standard-def')
    //     // img.removeAttribute('data-hi-def')
    //     // img.src = `/images/articles/art${id}-${img.alt}`
    //   }
    // })

    // return article.serialize()
    // // return value

    console.log("handling content fine.")
    return value;
  })

  eleventyConfig.addFilter(
    'replaceWithRegex',
    function (replaceThat, replaceWith) {
      let regex = new RegExp(replaceThat)
      return value.replace(regex, replaceWith)
    }
  )

  eleventyConfig.addFilter('cleanLink', function (value) {
    let regex = new RegExp('')
    return value.replace(/static\/outputs\/\d+?\//, '')
  })

  // add latin number plugin
  eleventyConfig.addFilter('romanize', function (value) {
    return romanize(value)
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function romanize(num) {
  // taken from Steven Levithan
  // https://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter

  if (isNaN(num)) return NaN
  var digits = String(+num).split(''),
    key = [
      '',
      'C',
      'CC',
      'CCC',
      'CD',
      'D',
      'DC',
      'DCC',
      'DCCC',
      'CM',
      '',
      'X',
      'XX',
      'XXX',
      'XL',
      'L',
      'LX',
      'LXX',
      'LXXX',
      'XC',
      '',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
    ],
    roman = '',
    i = 3
  while (i--) roman = (key[+digits.pop() + i * 10] || '') + roman
  return Array(+digits.join('') + 1).join('M') + roman
}

// to debug → get all the property of an element as a flat HTML

function propertiesToArray(value) {
  let stuff = flatten(value, { maxDepth: 10 })
  let content = ''
  for (var key in stuff) {
    content += `<section><div class="meta">${key}</div><div class="value">${
      stuff[key] != null ? stuff[key] : ''
    }</div></section>`
  }
  return content
}
