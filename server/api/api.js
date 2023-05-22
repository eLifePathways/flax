const { authenticate } = require('@coko/service-auth')

const {
  DOCXToHTMLAndSplitSyncController,
  DOCXToHTMLAndSplitAsyncController,
  DOCXToHTMLAsyncController,
  DOCXToHTMLSyncController,
} = require('./controllers')

const { uploadHandler } = require('./helpers')

const XSweetAPI = app => {
  app.post(
    '/api/v1/async/DOCXToHTML',
    authenticate,
    uploadHandler,
    DOCXToHTMLAsyncController,
  )
  app.post(
    '/api/v1/sync/DOCXToHTML',
    authenticate,
    uploadHandler,
    DOCXToHTMLSyncController,
  )
  app.post(
    '/api/v1/async/DOCXToHTMLAndSplit',
    authenticate,
    uploadHandler,
    DOCXToHTMLAndSplitAsyncController,
  )
  app.post(
    '/api/v1/sync/DOCXToHTMLAndSplit',
    authenticate,
    uploadHandler,
    DOCXToHTMLAndSplitSyncController,
  )
}

module.exports = XSweetAPI
