// const deepFreeze = require("./SiteHelpers/deepFreeze");
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
        favicon {
          id
          name
          storedObjects {
            mimetype
            key
            url
            type
          }
        }
        css
        article
      }
    }`,
    variables: {},
  });

  let response = await makeAPICall({ graphQLQuery, group });
  if (!response) {
    return false;
  }

  response.cmsLayout.publishConfig = JSON.parse(response.cmsLayout.publishConfig)

  // TODO We should not be mutating this object multiple times
  // in multiple branches of program execution. We should do
  // whatever manipulations we need to it right here, then pass
  // it down in a deep-frozen state.
  // Currently cmsLayoutQuery's syncData performs mutations on this,
  // and we don't seem to get exceptions thrown by it mutating a
  // deep frozen object. Perhaps javascript is not running in strict
  // mode?
  return response.cmsLayout // deepFreeze(response.cmsLayout)
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
              source
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