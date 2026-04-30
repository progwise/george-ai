import { Request, Response } from 'express'
import { pipeline } from 'stream/promises'

import { getReaderForUri, parseUri } from '@george-ai/file-management'

import { logger } from './common'
import { getUserContextFromExpressRequest } from './get-user-context'

export const handleDownloadGet = async (request: Request, response: Response) => {
  const { fileUri } = request.query
  logger.debug('Received handleDownloadGet request', {
    fileUri,
    requestQuery: request.query,
  })

  if (Array.isArray(fileUri)) {
    logger.warn('Invalid request parameters: fileUri is an array', { fileUri })
    response.status(400).end()
    return
  }

  logger.debug('Received request for download', { fileUri })

  const context = await getUserContextFromExpressRequest(request)

  if (!context.session?.user) {
    logger.warn('Unauthorized request: no user in session', { fileUri })
    response.status(401).end()
    return
  }

  if (!context.workspaceId) {
    logger.warn('Forbidden request: no workspaceId in context', { fileUri, userId: context.session.user.id })
    response.status(403).end()
    return
  }

  const { workspaceId } = parseUri(String(fileUri))

  if (workspaceId !== context.workspaceId) {
    logger.warn('Forbidden request: workspaceId in fileUri does not match context', {
      fileUri,
      workspaceId,
      contextWorkspaceId: context.workspaceId,
    })
    response.status(403).end()
    return
  }

  try {
    const { size, stream, mimeType, fileName } = await getReaderForUri(String(fileUri))
    response.setHeader('Content-Length', size)
    response.setHeader('Content-Type', mimeType)
    response.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/[^\x20-\x7E]/g, '').trim()}"`)
    logger.debug('Serving file stream', { fileUri, mimeType, size, fileName })
    await pipeline(stream, response)
    return
  } catch (error) {
    logger.error('Error streaming attachment to response', {
      fileUri,
      workspaceId: context.workspaceId,
      error,
    })
    if (!response.headersSent) {
      response.status(500).end()
    }
    return
  }
}
