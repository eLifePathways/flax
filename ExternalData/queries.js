const CMS_LAYOUT_QUERY = `
query cmsLayout {
    cmsLayout {
      id
      created
      updated
      primaryColor
      secondaryColor
      logo {
        id
        name
        tags
        storedObjects {
          mimetype
          key
          url
          type
        }
      }
    }
  }`;
