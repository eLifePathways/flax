const getConfig = () => {
	let baseUrl = process.env.FLAX_CLIENT_API_URL
		? process.env.FLAX_CLIENT_API_URL
		: "https://kotahi.kotahidev.cloud68.co";

	baseUrl = baseUrl.replace(/\/+$/, "");

	return {
		baseUrl: baseUrl,
		apiUrl: `${baseUrl}/graphql`,
	};
};

module.exports = { getConfig };
