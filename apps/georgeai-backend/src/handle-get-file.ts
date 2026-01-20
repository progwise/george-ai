import { Request, Response } from 'express'

import { workspaceStorage } from '@george-ai/file-management'

import { logger } from './common'
import { getUserContextFromExpressRequest } from './get-user-context'

export const handleGetFile = async (request: Request, response: Response) => {
  const { libraryId, fileId } = request.params
  const methodId = request.query['extraction'] ? String(request.query['extraction']) : undefined
  const fragment = request.query['fragment'] ? Number(request.query['fragment']) : undefined

  if (Array.isArray(libraryId) || Array.isArray(fileId)) {
    logger.debug('Invalid request parameters: libraryId or fileId is an array', { libraryId, fileId })
    response.status(400).end()
    return
  }

  logger.debug('Received request for library file', { libraryId, fileId, methodId, fragment })

  const context = await getUserContextFromExpressRequest(request)

  if (!context.session?.user) {
    response.status(401).end()
    return
  }

  if (!context.workspaceId) {
    response.status(403).end()
    return
  }

  const file = await workspaceStorage.getFile(context.workspaceId, {
    libraryId,
    fileId,
  })

  if (!file) {
    logger.error('File not found in workspace storage', { libraryId, fileId, workspaceId: context.workspaceId })
    response.status(404).end()
    return
  }

  if (methodId) {
    const extraction = await workspaceStorage.getExtraction(context.workspaceId, {
      libraryId,
      fileId,
      methodId,
    })
    if (!extraction) {
      logger.error('Extraction not found', { libraryId, fileId, methodId, workspaceId: context.workspaceId })
      response.status(404).end()
      return
    }
    if (fragment !== undefined) {
      const fragmentStream = await workspaceStorage.readExtraction(context.workspaceId, {
        libraryId,
        fileId,
        methodId,
        fragment,
      })
      response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      logger.debug('Serving extraction fragment stream', { libraryId, fileId, methodId, fragment })
      fragmentStream.pipe(response)
      return
    }
    const extractionStream = await workspaceStorage.readExtraction(context.workspaceId, {
      libraryId,
      fileId,
      methodId,
    })
    response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    logger.debug('Serving extraction stream', { libraryId, fileId, methodId })
    extractionStream.pipe(response)
    return
  }

  const sourceFileStream = await workspaceStorage.readSource(context.workspaceId, {
    libraryId,
    fileId,
  })

  response.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
  response.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`)
  response.setHeader('Content-Length', file.usage.sourceBytes)

  sourceFileStream.pipe(response)
}
