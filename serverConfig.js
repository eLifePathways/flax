const getConfig = () => {
	let baseUrl = process.env.FLAX_CLIENT_API_URL
		? process.env.FLAX_CLIENT_API_URL
		: "URL NOT FOUND";

	baseUrl = baseUrl.replace(/\/+$/, "");

	baseUrl = "http://localhost:4000";

	return {
		baseUrl: baseUrl,
		apiUrl: `${baseUrl}/graphql`,
	};
};

module.exports = { getConfig };
