
const { makeAPICall } = require("./api");

const getCMSLayout = async group => {
  let graphQLQuery = JSON.stringify({
    query: `
    query cmsLayout {
      cmsLayout {
        primaryColor
        secondaryColor
        footerText
        hexCode
        publishConfig
        flaxHeaderConfig {
          title
          sequenceIndex
          shownInMenu
          url
        }
        flaxFooterConfig {
          title
          sequenceIndex
          shownInMenu
          url
        }
        partners {
          url
          sequenceIndex
          file {
            name
            storedObjects {
              mimetype
              key
              url
              type
            }
          }
        }
        logo {
          id
          name
          storedObjects {
            mimetype
            key
            url
            type
          }
        }
      }
    }`,
    variables: {},
  });

  let response = await makeAPICall({ graphQLQuery, group });
  if (!response) {
    return false;
  }

  return response.cmsLayout
}

const getCmsPages = async group => {
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
    group,
  });

  if (!response) {
    return false;
  }

  return response.cmsPages;
}

const getArticles = async (group, limit, offset) => {
  const graphQLQuery = JSON.stringify({
    query: `query {
          manuscriptsPublishedSinceDate(limit: ${limit}, offset: ${offset}) {
            id
            shortId
            totalCount
            files {
              id
              name
              alt
              caption
              tags
              objectId
              storedObjects {
                type
                key
                size
                mimetype
                extension
                imageMetadata {
                  width
                  height
                  space
                  density
                }
                url
              }
              uploadStatus
              inUse
            }
            reviews {
              id
              jsonData
              user{
                id
                username
              }
            }
            decisions {
              id
              jsonData
              user{
                id
                username
              }
            }
            editors {
              name
              role
            }
            status
            meta {
              title
              source
              abstract
            }
            submission
            supplementaryFiles
            submissionWithFields
            publishedDate
            printReadyPdfUrl
            styledHtml
            css
            }
          }
        `,
    variables: {},
  });

  let response = await makeAPICall({
    graphQLQuery,
    group,
  });

  console.log("Article query responded.");

  if (!response) {
    return [];
  }

  return response;
}

module.exports = {
  getArticles,
  getCmsPages,
  getCMSLayout
};