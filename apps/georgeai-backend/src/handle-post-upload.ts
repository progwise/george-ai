import { Request, Response } from 'express'
import { Readable, Transform } from 'stream'

import { workspace } from '@george-ai/app-domain'
import { workspaceStorage } from '@george-ai/file-management'

import { logger } from './common'
import { getUserContextFromExpressRequest } from './get-user-context'

// Simple in-memory lock for file uploads to prevent race conditions
const uploadLocks = new Set<string>()

export const handlePostUpload = async (httpRequest: Request, httpResponse: Response) => {
  if (httpRequest.headers['content-type'] === 'multipart/form-data') {
    httpResponse.status(400).send('Bad Request: Multipart form data not supported')
    return
  }

  const uploadToken = httpRequest.headers['x-upload-token']

  if (!uploadToken) {
    httpResponse.status(400).send('Bad Request: x-upload-token header is required')
    return
  }

  // Try JWT or Bearer token authentication
  const context = await getUserContextFromExpressRequest(httpRequest)

  const userId = context.session?.user?.id

  if (!userId) {
    logger.warn('Unauthorized upload attempt with token to upload file', uploadToken)
    httpResponse.status(401).end()
    return
  }

  if (!context.workspaceId) {
    logger.warn('Forbidden upload attempt to workspace-less context for file', uploadToken)
    httpResponse.status(403).end()
    return
  }

  const fileInfo = await workspace.getUploadFileInfo({
    uploadToken: uploadToken as string,
    workspaceId: context.workspaceId,
  })

  if (!fileInfo) {
    httpResponse.status(400).send(`Bad Request: file info not found for ${uploadToken}`)
    return
  }

  if (fileInfo.uploadedAt) {
    httpResponse.status(400).send('Bad Request: x-upload-token outdated')
    return
  }

  if (fileInfo.createdAt < new Date(Date.now() - 1000 * 60 * 5)) {
    httpResponse.status(400).send('Bad Request: x-upload-token expired')
    return
  }

  if (!fileInfo.name) {
    httpResponse.status(400).send('Bad Request: File record is incomplete (missing name).')
    return
  }

  // const uploadedFilePath = getUploadFilePath({ fileId: fileInfo.id, libraryId: fileInfo.libraryId })
  const lockKey = fileInfo.id

  // Check if file is already being uploaded
  if (uploadLocks.has(lockKey)) {
    console.error('Upload already in progress for file:', fileInfo.id)
    httpResponse.status(409).send('Bad Request: File upload already in progress')
    return
  }

  // Track if upload completed successfully
  let uploadCompleted = false

  // Check if content is base64 encoded
  const contentEncoding = httpRequest.headers['content-encoding']
  let stream: Readable | undefined = undefined
  if (contentEncoding === 'base64') {
    const decoder = new Transform({
      transform(chunk, encoding, callback) {
        // Convert the base64 chunk string to a Buffer
        const buffer = Buffer.from(chunk.toString(), 'base64')
        callback(null, buffer)
      },
    })

    // Pipe the request into the decoder
    stream = httpRequest.pipe(decoder)
  } else {
    stream = httpRequest
  }

  // Acquire lock
  uploadLocks.add(lockKey)

  // Ensure lock is always released
  let lockReleased = false
  const releaseLock = () => {
    if (!lockReleased) {
      uploadLocks.delete(lockKey)
      lockReleased = true
    }
  }

  // Handle aborted requests - release lock immediately
  httpRequest.on('aborted', () => {
    releaseLock()
  })

  // Cleanup aborted uploads
  httpRequest.on('close', async () => {
    // Only clean up if upload was aborted (not completed successfully)
    if (uploadCompleted) {
      return
    }

    if (!httpRequest.destroyed) {
      return
    }

    logger.warn('Upload http request desctroyed', { fileInfo })
  })

  try {
    const fileManifest = await workspaceStorage.writeSource(context.workspaceId, {
      libraryId: fileInfo.libraryId,
      fileId: fileInfo.id,
      stream,
      meta: {
        mimeType: fileInfo.mimeType || 'application/octet-stream',
        originalName: fileInfo.name,
        originalUpdatedAt: fileInfo.updatedAt.toISOString(),
        originalContentHash: fileInfo.originFileHash,
      },
    })
    await workspace.markUploadFinished({
      fileId: fileInfo.id,
    })
    uploadCompleted = true
    httpResponse.statusCode = 200
    logger.info('File upload and processing completed', { fileInfo, fileManifest })
    httpResponse.end(JSON.stringify({ status: 'success' }))
  } catch (error) {
    logger.error('Error writing source to storage:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error writing source to storage'
    httpResponse.statusCode = 500
    httpResponse.write(JSON.stringify({ status: 'error', description: errorMessage }))
    httpResponse.end()
    return
  } finally {
    releaseLock()
  }
}
