const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
var https = require('https');
var http = require('http');

const protocol = (url) => {
    return url.includes('https') ? https : http;
}

const stringIsAValidUrl = (s) => {
    try {
      new URL(s)
      return true
    } catch (err) {
      return false
    }
}

const dirImagesPath = () => {
    return '../../public/assets/images/articles'
}

module.exports = function(eleventyConfig) {
    eleventyConfig.addFilter('imagesHandler', function (value, id) {
        return value;
        if (!fs.existsSync(dirImagesPath)) {
          fs.mkdir(path.join(__dirname, dirImagesPath), (err) => {
            if (err) {
              return console.error(err)
            }
            console.log('Directory created successfully!')
          })
        }
    
        const article = new JSDOM(value)
        let document = article.window.document
        document.body.querySelectorAll('img').forEach((img) => {
          //check url first
          if (stringIsAValidUrl(img.src)) {
            protocol(img.src)
              .get(img.src, (res) => {
                const file = fs.createWriteStream(
                  `${dirImagesPath}/art${id}-${img.alt}`
                )
                res.pipe(file)
                file.on('finish', () => {
                  file.close()
                  console.log(`${img.src} has been downloaded!`)
                })
              })
              .on('error', (err) => {
                console.log(err, res)
                // console.log('Error: ', err.message)
              })
            img.removeAttribute('data-low-def')
            img.removeAttribute('data-standard-def')
            img.removeAttribute('data-hi-def')
            img.src = `/assets/images/articles/art${id}-${img.alt}`
          }
        })
    
        return article.serialize()
    })
};
  