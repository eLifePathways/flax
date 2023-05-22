const XSweetAPI = require('./api')

module.exports = {
  server: () => app => XSweetAPI(app),
}
