// required packages
const axios = require('axios')
const config = require('./config.js')
const { AssetCache } = require('@11ty/eleventy-cache-assets')
const path = require('path')
const GRAPHQL_URL = config.url

const getData = async () => {
  let cachedArticles = new AssetCache(`articles`)

  if (cachedArticles.isCacheValid('2d') && config.cache == true) {
    let data = await cachedArticles.getCachedValue()
    return { articles: data }
  } else {
    const graphqlQuery = async ({ query }) => {
      const response = await axios.post(GRAPHQL_URL, {
        query: query,
      })

      if (response.status == 200) {
        return response.data.data
      }
      // Todo: fallback for failure
    }

    const data = await graphqlQuery({
      query: `{
  manuscriptsPublishedSinceDate(startDate: 1624101179050, limit: null) {
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
    // This is being done because "submission" comes in as stringified JSON which needs to be unstringified to use in templates
    const parsedArticles = data.manuscriptsPublishedSinceDate.map((article) => {
      // console.log(article)
      return { parsedSubmission: JSON.parse(article.submission), ...article }
    })

    await cachedArticles.save(parsedArticles, 'json')
    return {
      articles: parsedArticles,
    }
  }
}

module.exports = getData
