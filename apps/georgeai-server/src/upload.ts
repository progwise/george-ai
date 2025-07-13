import { Request, Response } from 'express'
import * as fs from 'fs'

import { getFileDir, getUploadFilePath } from '@george-ai/file-management'
import { convertUploadToMarkdown, getFileInfo } from '@george-ai/pothos-graphql'

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

  const fileInfo = await getFileInfo(uploadToken as string)

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

  const filestream = fs.createWriteStream(uploadedFilePath, {
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
      await convertUploadToMarkdown(fileInfo.id, { removeUploadFile: false })
      httpResponse.end(JSON.stringify({ status: 'success' }))
    })
  })

  // Cleanup aborted uploads
  httpRequest.on('close', async () => {
    if (!httpRequest.complete) {
      console.warn('Upload aborted, cleaning up...', fileInfo.id, fileInfo.name)
      filestream.close()
      const fileDir = getFileDir({ fileId: fileInfo.id, libraryId: fileInfo.libraryId })
      try {
        await fs.promises.rm(fileDir, { recursive: true, force: true })
        console.log(`Cleanup successful for aborted upload: ${fileInfo.id}`)
      } catch (error) {
        console.error('Error during cleanup after upload abort:', error)
      }
    }
  })
}
