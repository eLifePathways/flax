const { makeAPICall } = require("../../api");
const fs = require("fs");
const { getGroupDataDir } = require("../../helpers");

const getPages = async group => {
  let graphQLQuery = JSON.stringify({
    query: `query cmsPages {
      cmsPages {
				id
				title
				created
				content
				url
      }
    }`,
  });

  let response = await makeAPICall({ 
		graphQLQuery, 
		group
	});

  if (!response) {
    return false;
  }

  return {
    pages: response.cmsPages,
  };
};

const syncData = async (group) => {

  const dataFile = getGroupDataDir(group)+'/cmsPages.json';
  let data = await getPages(group);

  if (data) {
    fs.writeFileSync(dataFile, JSON.stringify(data), "utf8");
  }
};
module.exports = { syncData };