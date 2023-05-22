const { startServer, boss, logger } = require('@coko/server')
const {
  DOCXToHTMLAsyncHandler,
  DOCXToHTMLAndSplitAsyncHandler,
} = require('./api/useCase')

const {
  DOCX_TO_HTML_AND_SPLIT_JOB,
  DOCX_TO_HTML_JOB,
  MICROSERVICE_NAME,
} = require('./api/constants')

const init = async () => {
  logger.info(`${MICROSERVICE_NAME} server: about to initialize job queues`)
  startServer().then(async () => {
    boss.subscribe(DOCX_TO_HTML_JOB, async job => {
      const { data } = job
      const {
        filePath,
        callbackURL,
        serviceCallbackTokenId,
        objectId,
        responseToken,
      } = data

      const responseParams = {
        callbackURL,
        serviceCallbackTokenId,
        objectId,
        responseToken,
      }

      await DOCXToHTMLAsyncHandler(filePath, responseParams)
      return true
    })
    logger.info(
      `${MICROSERVICE_NAME} server: queue ${DOCX_TO_HTML_JOB} registered`,
    )

    boss.subscribe(DOCX_TO_HTML_AND_SPLIT_JOB, async job => {
      const { data } = job

      const {
        filePath,
        callbackURL,
        serviceCallbackTokenId,
        responseToken,
      } = data

      const responseParams = {
        callbackURL,
        serviceCallbackTokenId,
        responseToken,
      }
      await DOCXToHTMLAndSplitAsyncHandler(filePath, responseParams)
      return true
    })
    logger.info(
      `${MICROSERVICE_NAME} server: queue ${DOCX_TO_HTML_AND_SPLIT_JOB} registered`,
    )
  })
}

init()
