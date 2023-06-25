const axios = require('axios');
const config = require('./config.json')
var https = require('https');
var http = require('http');
const fs = require('fs')

const storeLogoFile = async (logo) => {
  if(!logo || !logo.storedObjects) {
    return;
  }

  let originalImage =  logo.storedObjects.find(storedObject => storedObject.type === 'original');

  if(!originalImage) {
    return;
  }

  let server = http;

  if(originalImage.url.includes('https')) {
    server = https;
  }
  server
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
      console.log(`${originalImage.url} has been downloaded!`)
    })
  })
  .on('error', (err) => {
    console.log(err)
    // console.log('Error: ', err.message)
  })

  console.log({originalImage})
}

const getData = async () => {
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
    console.log("Error while fetching cms layout", err)
    return {}
  }
}



module.exports = getData