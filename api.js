const axios = require("axios");
const { getConfig } = require("./serverConfig");

const makeAPICall = async ({ graphQLQuery, updatedRequestData }) => {
	let requestData = {
		data: graphQLQuery,
		headers: { "Content-Type": "application/json" },
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
