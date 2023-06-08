const axios = require('axios');
const config = require('./config.json')


const cleanMeta = (pageMeta, cmsPage) => {
  let meta = {};
  if(!pageMeta) {
    return meta;
  }
  if(typeof pageMeta != "object") {
    meta = JSON.parse(pageMeta)
  }

  meta.menu = meta.menu == undefined ? true : meta.menu
  meta.url = meta.url ? meta.url : cmsPage.shortcode
  return meta;
}

const getData = async () => {
  let graphQLQuery = JSON.stringify({
    query: `query cmsPages {
      cmsPages {
          id
          title
          shortcode
          created
          content
          meta
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
    let cmsPages = response.data.data.cmsPages;
    let results = {};

    for(let i in cmsPages) {
      let cmsPage = cmsPages[i];
      cmsPage.meta = cleanMeta(cmsPage.meta, cmsPage)
      console.log({meta: cmsPage.meta})
      results[cmsPage.shortcode] = cmsPage
    }
    return results

  }catch(err) {
    console.log("Error while flax page", err)
    return {
      about_us: {}
    }
  }
}

// getData()

module.exports = getData