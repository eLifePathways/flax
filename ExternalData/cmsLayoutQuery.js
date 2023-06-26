const axios = require('axios');
const config = require('../src/data/config.json')
var https = require('https');
var http = require('http');
const fs = require('fs')

const dataFile = `src/data/cmsLayout.json`

const storeLogoFile = async (logo) => {
  if(!logo || !logo.storedObjects) {
    return;
  }

  let originalImage =  logo.storedObjects.find(storedObject => storedObject.type === 'original');

  if(!originalImage) {
    return;
  }

  let protocol = http;
  
  if(originalImage.url.includes('https')) {
    protocol = https;
  }
  protocol
  .get(originalImage.url, (res) => {
    let isValidUrl = res.statusCode >= 200 && res.statusCode <= 300;
    if(!isValidUrl) {
      return;
    }
    const file = fs.createWriteStream(
      `public/assets/images/logo.png`
    )
    res.pipe(file)
    file.on('finish', () => {
      file.close()
    })
  })
  .on('error', (err) => {
    console.error(err)
  })
}

const getLayoutInfo = async () => {
  let graphQLQuery = JSON.stringify({
    query: `query cmsLayout {
      cmsLayout {
        id
        created
        updated
        primaryColor
        secondaryColor
        logo {
          id
          name
          tags
          storedObjects {
            mimetype
            key
            url
            type
          }
        }
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
    let cmsLayout = response.data.data.cmsLayout;
    storeLogoFile(cmsLayout.logo)
    return cmsLayout
  }catch(err) {
    console.error("Error while fetching cms layout", err.message)
    return {}
  }
}

const syncData = async () => {
  let data = await getLayoutInfo()
  fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
}

module.exports = {syncData}