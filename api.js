const axios = require("axios");
const { getConfig } = require("./serverConfig");

const makeAPICall = async ({ graphQLQuery, updatedRequestData, group }) => {
	const dafaultHeaders = { 
		"Content-Type": "application/json",
		"group-id": group.id 
	};
	
	let requestData = {
		data: graphQLQuery,
		headers: dafaultHeaders,
		method: "post",
		maxBodyLength: Infinity,
		url: getConfig().apiUrl,
	};

	if (updatedRequestData) {
		requestData = { ...requestData, ...updatedRequestData };
	}

	try {
		let response = await axios.request(requestData);
		let responseData = response.data.data;
		return responseData;
	} catch (err) {
		console.log("Error while making a API call.", {
			requestData,
			err,
		});

		return false;
	}
};

module.exports = { makeAPICall };
