const axios = require('axios');
const config = require('./config.json')

const getData = async () => {
  let graphQLQuery = JSON.stringify({
    query: `query flaxPageByShortcode($shortcode: String!) {
      flaxPageByShortcode(shortcode: $shortcode) {
          id
          title
          shortcode
          created
          content {
            header
            body
            footer
          }
      }
    }`,
    variables: {"shortcode":"about_us"}
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
    response = response.data.data;
    console.log("fetched flax page", response)
    return {
      about_us: response.flaxPageByShortcode
    }
  }catch(err) {
    console.log("Error while flax page", err)
    return {
      about_us: {}
    }
  }

}


module.exports = getData