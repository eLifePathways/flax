const axios = require('axios');
const config = require('../src/data/config.json')
const fs = require("fs");

const dataFile = `src/data/cmsLayout.json`

const cleanMeta = (cmsPage) => {
  let pageMeta = cmsPage.meta;
  let updatedMeta = {};
  if(!pageMeta) {
    return updatedMeta;
  }
  if(typeof pageMeta != "object") {
    updatedMeta = JSON.parse(pageMeta)
  }
  cmsPage.meta = updatedMeta;
  return updatedMeta;
}

const getPages = async () => {
  let graphQLQuery = JSON.stringify({
    query: `query cmsPages {
      cmsPages {
          id
          title
          shortcode
          created
          content
          meta
          menu
          url
          sequenceIndex
      }
    }`,
    variables: {}
  });
  
  let requestData = {
    url: config.url,
    method: 'post',
    data : graphQLQuery,
    maxBodyLength: Infinity,
    headers: { 
      'Content-Type': 'application/json'
    }
  };
  try {
    let response = await axios.request(requestData)
    let cmsPagesData = response.data.data.cmsPages;
    let pageShortCodes = {};
    let cmsPages = [];
    for(let i in cmsPagesData) {
      let cmsPage = cmsPagesData[i];
      cleanMeta(cmsPage)
      pageShortCodes[cmsPage.shortcode] = cmsPage
      cmsPages.push(cmsPage)
    }

    return {
      shortCodePages: pageShortCodes,
      pages: cmsPages
    }
  }catch(err) {
    console.log("Error while fetching flax pages", err.message)
    return {
      pages: []
    }
  }
}

const syncData = async () => {
  let data = await getPages()
  fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
}

module.exports = {syncData}