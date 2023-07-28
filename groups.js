const { makeAPICall } = require("./api");

const getGroups = async () => {
  let graphQLQuery = JSON.stringify({
    query: `query groups {
      groups {
				id
				name
      }
    }`,
  });

  let response = await makeAPICall({ 
		graphQLQuery, 
		group: {id:""}
	});

  if (!response) {
    return false;
  }
  
  return response.groups
};

const getGroupById = async (groupId) => {
  const groups = await getGroups();
  const group = groups.find(group => group.id === groupId);
  return group;
};

module.exports = { getGroupById, getGroups };
