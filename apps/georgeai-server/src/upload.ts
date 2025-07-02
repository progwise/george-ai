import { Request, Response } from 'express'
import * as fs from 'fs'

import { checkFileUpload, cleanupFile, completeFileUpload, getFilePath } from '@george-ai/pothos-graphql'

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

  const file = await checkFileUpload(uploadToken as string)

  if (!file) {
    httpResponse.status(400).send('Bad Request: x-upload-token is invalid')
    return
  }

  if (file.uploadedAt) {
    httpResponse.status(400).send('Bad Request: x-upload-token outdated')
    return
  }

  if (file.createdAt < new Date(Date.now() - 1000 * 60 * 5)) {
    httpResponse.status(400).send('Bad Request: x-upload-token expired')
    return
  }

  if (!file.name) {
    httpResponse.status(400).send('Bad Request: File record is incomplete (missing name).')
    return
  }

  const tempFilePath = getFilePath(file.id, file.name)

  const filestream = fs.createWriteStream(tempFilePath, {
    flags: 'a',
  })

  filestream.on('error', (error) => {
    console.error(error)
    httpResponse.statusCode = 400
    httpResponse.write(JSON.stringify({ status: 'error in filestream', description: error }))
    httpResponse.end()
  })

  httpRequest.pipe(filestream)

  httpRequest.on('end', () => {
    filestream.close(async () => {
      await completeFileUpload(file.id)
      httpResponse.end(JSON.stringify({ status: 'success' }))
    })
  })

  // Cleanup aborted uploads
  httpRequest.on('close', async () => {
    if (!httpRequest.complete) {
      console.warn('Upload aborted, cleaning up...', file.id, file.name)
      filestream.close()
      try {
        await cleanupFile(file.id)
      } catch (error) {
        console.error('Error during cleanup after upload abort:', error)
      }
    }
  })
}
