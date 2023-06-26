const fs = require("fs");
const axios = require('axios')
const config = require('../../src/data/config.json')
const { AssetCache } = require('@11ty/eleventy-cache-assets')
// const GRAPHQL_URL = config.url
const GRAPHQL_URL = 'https://kotahidev.cloud68.co/graphql/'

const dataFile = `src/data/articleQuery.json`


const getAllTheArticles = async () => {
  let cachedArticles = new AssetCache(`articles`)
  // let data = await cachedArticles.getCachedValue()
  // return { articles: data }
  if (cachedArticles.isCacheValid('10d') && config.cache == true) {
    let data = await cachedArticles.getCachedValue()
    return { articles: data }
  } else {
    const graphqlQuery = async ({ query }) => {

      try {
        const response = await axios.post(GRAPHQL_URL, {
          query: query,
        })
  
        if (response.status == 200) {
          return response.data.data
        }
      } catch(err) {
        return false
      }
    }

    const data = await graphqlQuery({
      query: `{
  manuscriptsPublishedSinceDate(limit: 10) {
  id
  shortId
  files {
    id
    name
    alt
    caption
    tags
    objectId
    storedObjects {
      type
      key
      size
      mimetype
      extension
      imageMetadata {
        width
        height
        space
        density
      }
      url
    }
    uploadStatus
    inUse
  }
  status
  meta {
    title
    source
    abstract
  }
  submission
  publishedDate
  printReadyPdfUrl
  styledHtml
  css
   }
}`,
    })

    if(!data) {
      return {
        articles: [],
      }
    }

    // This is being done because "submission" comes in as stringified JSON which needs to be unstringified to use in templates
    const parsedArticles = data.manuscriptsPublishedSinceDate.map((article) => {
      return { parsedSubmission: JSON.parse(article.submission), ...article }
    })

    await cachedArticles.save(parsedArticles, 'json')
    return {
      articles: parsedArticles,
    }
  }
}

const syncData = async () => {
    let data = await getAllTheArticles()
    fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
}

module.exports = { syncData}
