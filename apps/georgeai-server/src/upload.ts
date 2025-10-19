import { Request, Response } from 'express'
import * as fs from 'fs'

import { getFileDir, getUploadFilePath } from '@george-ai/file-management'
import { getFileInfo, markUploadFinished } from '@george-ai/pothos-graphql'

import { getUserContext } from './getUserContext'

// Simple in-memory lock for file uploads to prevent race conditions
const uploadLocks = new Set<string>()

export const dataUploadMiddleware = async (httpRequest: Request, httpResponse: Response) => {
  if (httpRequest.method.toUpperCase() !== 'POST') {
    httpResponse.status(405).send('Method Not Allowed')
    return
  }

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
  const context = await getUserContext(() => {
    return {
      jwtToken: httpRequest.headers['x-user-jwt']
        ? httpRequest.headers['x-user-jwt'].toString()
        : httpRequest.cookies['keycloak-token'] || null,
      bearerToken: httpRequest.headers['authorization']?.toString().startsWith('Bearer ')
        ? httpRequest.headers['authorization'].toString().substring(7)
        : null,
    }
  })

  const userId = context.session?.user?.id

  if (!userId) {
    console.warn('Unauthorized upload attempt with token to upload file', uploadToken)
    httpResponse.status(401).end()
    return
  }

  const fileInfo = await getFileInfo(uploadToken as string, userId)

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

  const uploadedFilePath = getUploadFilePath({ fileId: fileInfo.id, libraryId: fileInfo.libraryId })
  const lockKey = fileInfo.id

  // Check if file is already being uploaded
  if (uploadLocks.has(lockKey)) {
    console.error('Upload already in progress for file:', fileInfo.id)
    httpResponse.status(409).send('Bad Request: File upload already in progress')
    return
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

  // Track if upload completed successfully
  let uploadCompleted = false

  // Check if content is base64 encoded
  const contentEncoding = httpRequest.headers['content-encoding']
  const isBase64 = contentEncoding === 'base64'

  const filestream = fs.createWriteStream(uploadedFilePath, {
    flags: 'a',
  })

  filestream.on('error', (error) => {
    console.error(error)
    releaseLock()
    httpResponse.statusCode = 400
    httpResponse.write(JSON.stringify({ status: 'error in filestream', description: error }))
    httpResponse.end()
  })

  if (isBase64) {
    // Handle base64 encoded data
    let base64Data = ''

    httpRequest.on('data', (chunk) => {
      base64Data += chunk.toString()
    })

    httpRequest.on('end', () => {
      // Mark as completed immediately to prevent cleanup race condition
      uploadCompleted = true

      try {
        // Decode base64 and write to file
        const buffer = Buffer.from(base64Data, 'base64')
        filestream.write(buffer)
        filestream.close(async () => {
          try {
            await markUploadFinished({
              fileId: fileInfo.id,
              libraryId: fileInfo.libraryId,
              userId: userId,
            })
            releaseLock()
            httpResponse.statusCode = 200
            console.log('File upload and processing completed (base64):', fileInfo.id, fileInfo.name)
            httpResponse.end(JSON.stringify({ status: 'success' }))
          } catch (error) {
            console.error('Error during file processing:', error)
            releaseLock()
            const errorMessage = error instanceof Error ? error.message : 'Error during file processing'
            httpResponse.statusCode = 500
            httpResponse.write(JSON.stringify({ status: 'error', description: errorMessage }))
            httpResponse.end()
          }
        })
      } catch (error) {
        console.error('Error decoding base64:', error)
        releaseLock()
        httpResponse.statusCode = 400
        httpResponse.write(JSON.stringify({ status: 'error', description: 'Invalid base64 data' }))
        httpResponse.end()
      }
    })
  } else {
    // Handle binary data (original behavior)
    httpRequest.pipe(filestream)

    httpRequest.on('end', () => {
      // Mark as completed immediately to prevent cleanup race condition
      uploadCompleted = true

      filestream.close(async () => {
        try {
          await markUploadFinished({
            fileId: fileInfo.id,
            libraryId: fileInfo.libraryId,
            userId: userId,
          })
          releaseLock()
          httpResponse.statusCode = 200
          console.log('File upload and processing completed:', fileInfo.id, fileInfo.name)
          httpResponse.end(JSON.stringify({ status: 'success' }))
        } catch (error) {
          console.error('Error during file processing:', error)
          releaseLock()
          const errorMessage = error instanceof Error ? error.message : 'Error during file processing'
          httpResponse.statusCode = 500
          httpResponse.write(JSON.stringify({ status: 'error', description: errorMessage }))
          httpResponse.end()
        }
      })
    })
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

    // Request was destroyed (aborted) - clean up files
    filestream.close()
    const fileDir = getFileDir({ fileId: fileInfo.id, libraryId: fileInfo.libraryId })
    try {
      await fs.promises.rm(fileDir, { recursive: true, force: true })
    } catch (error) {
      console.error('Error during cleanup after upload abort:', error)
    }
  })
}
