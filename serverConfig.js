const getConfig = () => {
	let baseUrl = process.env.FLAX_CLIENT_API_URL
		? process.env.FLAX_CLIENT_API_URL
		: "http://localhost:4000";

	baseUrl = baseUrl.replace(/\/+$/, "");

	return {
		baseUrl: baseUrl,
		apiUrl: `${baseUrl}/graphql`,
	};
};

module.exports = { getConfig };
