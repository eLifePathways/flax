const axios = require('axios');
const config = require('./config.json')

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
    return response.data.data.cmsLayout
  }catch(err) {
    console.log("Error while fetching cms layout", err)
    return {}
  }
}

module.exports = getData