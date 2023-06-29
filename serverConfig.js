const getConfig = () => {
  let baseUrl = process.env.FLAX_CLIENT_API_URL
    ? process.env.FLAX_CLIENT_API_URL
    : "http://client:4000";

  baseUrl = baseUrl.replace(/\/+$/, "");

  baseUrl = "https://a33b-111-223-30-157.ngrok-free.app";

  return {
    baseUrl: baseUrl,
    apiUrl: `${baseUrl}/graphql`,
  };
};

module.exports = { getConfig };
