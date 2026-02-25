import { Request, Response } from 'express'
import { pipeline } from 'stream/promises'

import { getExtractionMethod } from '@george-ai/app-commons'
import {
  ExtractionManifest,
  getDocumentManifest,
  getExtraction,
  readExtraction,
  readSource,
} from '@george-ai/app-domain'
import { readAttachment } from '@george-ai/file-management/src/workspace-storage/attachment'

import { logger } from './common'
import { getUserContextFromExpressRequest } from './get-user-context'

export const handleFileGet = async (request: Request, response: Response) => {
  const { libraryId, fileId } = request.params
  const { extraction, attachment, fragment } = request.query
  logger.debug('Received handleFileGet request', {
    libraryId,
    fileId,
    extraction,
    attachment,
    fragment,
    requestQuery: request.query,
  })
  const extractionMethod = extraction ? getExtractionMethod(String(extraction)) : undefined
  const fragmentNumber = fragment ? Number(fragment) : undefined

  if (Array.isArray(libraryId) || Array.isArray(fileId)) {
    logger.warn('Invalid request parameters: libraryId or fileId is an array', { libraryId, fileId })
    response.status(400).end()
    return
  }

  logger.debug('Received request for get-file', { libraryId, fileId, extractionMethod, attachment, fragment })

  const context = await getUserContextFromExpressRequest(request)

  if (!context.session?.user) {
    logger.warn('Unauthorized request: no user in session', { libraryId, fileId })
    response.status(401).end()
    return
  }

  if (!context.workspaceId) {
    logger.warn('Forbidden request: no workspaceId in context', { libraryId, fileId, userId: context.session.user.id })
    response.status(403).end()
    return
  }

  const fileManifest = await getDocumentManifest(context.workspaceId, {
    libraryId,
    documentId: fileId,
  })

  if (!fileManifest) {
    logger.warn('File not found in workspace storage', { libraryId, fileId, workspaceId: context.workspaceId })
    response.status(404).end()
    return
  }

  let extractionManifest: ExtractionManifest | null = null
  if (extractionMethod) {
    extractionManifest = await getExtraction(context.workspaceId, {
      libraryId,
      documentId: fileId,
      extractionMethod,
    })
    if (!extractionManifest) {
      logger.warn('Extraction not found', { libraryId, fileId, extractionMethod, workspaceId: context.workspaceId })
      response.status(404).end()
      return
    }
  }

  if (attachment) {
    try {
      const {
        stream: attachmentStream,
        size: attachmentSize,
        mimeType,
      } = await readAttachment(extractionManifest || fileManifest, String(attachment))
      response.setHeader('Content-Length', attachmentSize)
      response.setHeader('Content-Type', mimeType)
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${String(attachment)
          .replace(/[^\x20-\x7E]/g, '')
          .trim()}"`, // TODO: Handle Icon / non unicode in name strings...
      )
      logger.debug('Serving file attachment stream', { libraryId, fileId, attachment })
      await pipeline(attachmentStream, response)
      return
    } catch (error) {
      logger.error('Error streaming attachment to response', {
        libraryId,
        fileId,
        attachment,
        workspaceId: context.workspaceId,
        error,
      })
      if (!response.headersSent) {
        response.status(500).end()
      }
      return
    }
  }

  if (extractionManifest) {
    const { stream: fragmentStream, size: extractionSize } = await readExtraction({
      ...extractionManifest,
      ...(fragmentNumber ? { fragment: fragmentNumber } : {}),
    })
    response.setHeader('Content-Length', extractionSize)
    response.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    logger.debug('Serving extraction  stream', { libraryId, fileId, extractionMethod, fragment })
    for await (const line of fragmentStream) {
      response.write(line + '\n')
    }
    response.end()
    return
  }

  const { stream: sourceFileStream, fileSize } = await readSource(context.workspaceId, {
    libraryId,
    documentId: fileId,
  })

  try {
    response.setHeader('Content-Type', fileManifest.mimeType)
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileManifest.name.replace(/[^\x20-\x7E]/g, '').trim()}"`, // TODO: Handle Icon / non unicode in name strings...
    )
    response.setHeader('Content-Length', fileSize)

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
