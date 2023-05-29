const axios = require('axios');
const config = require('./config.json')

const getData = async () => {
  let graphQLQuery = JSON.stringify({
    query: `query flaxPage($id: ID) {
      flaxPage(id: $id) {
          id
          title
          created
          content {
            header
            body
            footer
          }
      }
    }`,
    variables: {"id":"18842150-b299-4e90-b0a5-6bddd03e7a1d"}
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
    console.log(response)
    return {
      about_us: response.flaxPage
    }
  }catch(err) {
    return {
      about_us: {}
    }
  }

}


module.exports = getData