const fs = require('fs-extra')
const { boss, logger } = require('@coko/server')
const {
  DOCXToHTMLSyncHandler,
  DOCXToHTMLAndSplitSyncHandler,
} = require('./useCase')
const {
  DOCX_TO_HTML_AND_SPLIT_JOB,
  DOCX_TO_HTML_JOB,
  MICROSERVICE_NAME,
} = require('./constants')

const DOCXToHTMLAsyncController = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ msg: req.fileValidationError })
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'docx file is not included' })
    }

    const {
      serviceCallbackTokenId,
      objectId,
      responseToken,
      callbackURL,
    } = req.body

    if (!serviceCallbackTokenId) {
      throw new Error(`request's parameter serviceCallbackTokenId is required`)
    }
    if (!objectId) {
      throw new Error(`request's parameter objectId is required`)
    }
    if (!responseToken) {
      throw new Error(`request's parameter responseToken is required`)
    }
    if (!callbackURL) {
      throw new Error(`request's parameter callbackURL is required`)
    }

    const { path: filePath } = req.file
    logger.info(
      `${MICROSERVICE_NAME} controller(DOCXToHTMLAsyncController): publishes a job to the ${DOCX_TO_HTML_JOB} queue`,
    )
    await boss.publish(DOCX_TO_HTML_JOB, {
      filePath,
      callbackURL,
      serviceCallbackTokenId,
      objectId,
      responseToken,
    })

    return res.status(200).json({
      msg: 'ok',
      error: null,
    })
  } catch (e) {
    const { path: filePath } = req.file
    await fs.remove(filePath)
    return res.status(500).json({ error: e.message, msg: null })
  }
}

const DOCXToHTMLSyncController = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ msg: req.fileValidationError })
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'docx file is not included' })
    }

    const { path: filePath } = req.file

    logger.info(
      `${MICROSERVICE_NAME} controller(DOCXToHTMLSyncController): executes DOCXToHTMLSyncHandler`,
    )

    const htmlContent = await DOCXToHTMLSyncHandler(filePath)

    return res.status(200).json({
      html: htmlContent,
      error: null,
    })
  } catch (e) {
    return res.status(500).json({ html: null, error: e.message })
  }
}

const DOCXToHTMLAndSplitAsyncController = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ msg: req.fileValidationError })
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'docx file is not included' })
    }

    const { serviceCallbackTokenId, responseToken, callbackURL } = req.body

    if (!serviceCallbackTokenId) {
      throw new Error(`request's parameter serviceCallbackTokenId is required`)
    }

    if (!responseToken) {
      throw new Error(`request's parameter responseToken is required`)
    }
    if (!callbackURL) {
      throw new Error(`request's parameter callbackURL is required`)
    }

    const { path: filePath } = req.file
    logger.info(
      `${MICROSERVICE_NAME} controller(DOCXToHTMLAndSplitAsyncController): publishes a job to the ${DOCX_TO_HTML_AND_SPLIT_JOB} queue`,
    )

    await boss.publish(DOCX_TO_HTML_AND_SPLIT_JOB, {
      filePath,
      callbackURL,
      serviceCallbackTokenId,
      responseToken,
    })

    return res.status(200).json({
      msg: 'ok',
      error: null,
    })
  } catch (e) {
    const { path: filePath } = req.file
    await fs.remove(filePath)
    return res.status(500).json({ error: e.message, msg: null })
  }
}

const DOCXToHTMLAndSplitSyncController = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ msg: req.fileValidationError })
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'docx file is not included' })
    }

    const { path: filePath } = req.file
    logger.info(
      `${MICROSERVICE_NAME} controller(DOCXToHTMLAndSplitSyncController): executes DOCXToHTMLAndSplitSyncHandler`,
    )

    const chapters = await DOCXToHTMLAndSplitSyncHandler(filePath)

    return res.status(200).json({
      chapters,
      error: null,
    })
  } catch (e) {
    return res.status(500).json({ chapters: [], error: e.message })
  }
}

module.exports = {
  DOCXToHTMLAsyncController,
  DOCXToHTMLAndSplitAsyncController,
  DOCXToHTMLSyncController,
  DOCXToHTMLAndSplitSyncController,
}
