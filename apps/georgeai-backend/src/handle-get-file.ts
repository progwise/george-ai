import { Request, Response } from 'express'
import { pipeline } from 'stream/promises'

import { getExtractionMethod } from '@george-ai/app-commons'
import { getDocumentManifest, getExtraction, readExtraction, readSource } from '@george-ai/app-domain'

import { logger } from './common'
import { getUserContextFromExpressRequest } from './get-user-context'

export const handleGetFile = async (request: Request, response: Response) => {
  const { libraryId, fileId } = request.params
  const { extraction, fragment } = request.query
  logger.info('Handling get file request', { libraryId, fileId, extraction, fragment })
  const extractionMethod = extraction ? getExtractionMethod(String(extraction)) : undefined
  const fragmentNumber = fragment ? Number(fragment) : undefined

  if (Array.isArray(libraryId) || Array.isArray(fileId)) {
    logger.debug('Invalid request parameters: libraryId or fileId is an array', { libraryId, fileId })
    response.status(400).end()
    return
  }

  logger.debug('Received request for get-file', { libraryId, fileId, extractionMethod, fragment })

  const context = await getUserContextFromExpressRequest(request)

  if (!context.session?.user) {
    logger.debug('Unauthorized request: no user in session', { libraryId, fileId })
    response.status(401).end()
    return
  }

  if (!context.workspaceId) {
    logger.debug('Forbidden request: no workspaceId in context', { libraryId, fileId, userId: context.session.user.id })
    response.status(403).end()
    return
  }

  const fileManifest = await getDocumentManifest(context.workspaceId, {
    libraryId,
    documentId: fileId,
  })

  if (!fileManifest) {
    logger.error('File not found in workspace storage', { libraryId, fileId, workspaceId: context.workspaceId })
    response.status(404).end()
    return
  }

  if (extractionMethod) {
    const extraction = await getExtraction(context.workspaceId, {
      libraryId,
      documentId: fileId,
      extractionMethod,
    })
    if (!extraction) {
      logger.error('Extraction not found', { libraryId, fileId, extractionMethod, workspaceId: context.workspaceId })
      response.status(404).end()
      return
    }
    if (fragmentNumber) {
      const fragmentStream = await readExtraction(context.workspaceId, {
        libraryId,
        documentId: fileId,
        extractionMethod,
        fragment: fragmentNumber,
      })
      response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      logger.debug('Serving extraction fragment stream', { libraryId, fileId, extractionMethod, fragment })
      for await (const line of fragmentStream) {
        response.write(line + '\n')
      }
      response.end()
      return
    }
    const extractionStream = await readExtraction(context.workspaceId, {
      libraryId,
      documentId: fileId,
      extractionMethod,
    })
    response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    logger.debug('Serving extraction stream', { libraryId, fileId, extractionMethod })
    for await (const line of extractionStream) {
      response.write(line + '\n')
    }
    response.end()
    return
  }

  const { stream: sourceFileStream, fileSize } = await readSource(context.workspaceId, {
    libraryId,
    documentId: fileId,
  })

  logger.debug('Serving source file stream', { libraryId, fileId, workspaceId: context.workspaceId, fileManifest })

  response.setHeader('Content-Type', fileManifest.mimeType || 'application/octet-stream')
  response.setHeader('Content-Disposition', `attachment; filename="${fileManifest.name}"`)
  response.setHeader('Content-Length', fileSize)

  try {
    logger.debug('Piping source file stream to response', { libraryId, fileId, workspaceId: context.workspaceId })
    await pipeline(sourceFileStream, response)
    logger.debug('Finished piping source file stream to response', {
      libraryId,
      fileId,
      workspaceId: context.workspaceId,
    })
  } catch (error) {
    logger.error('Error streaming file to response', { libraryId, fileId, workspaceId: context.workspaceId, error })
    if (!response.headersSent) {
      response.status(500)
    }
    throw error
  }
}
