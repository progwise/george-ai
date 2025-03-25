import { Request, Response } from 'express'
import * as fs from 'fs'

import { checkFileUpload, completeFileUpload, getFilePath } from '@george-ai/pothos-graphql'

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

  const filestream = fs.createWriteStream(getFilePath(file.id), {
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
    filestream.close(() => {
      httpResponse.end(JSON.stringify({ status: 'success' }))
    })
  })

  // Cleanup aborted uploads
  httpRequest.on('close', async () => {
    if (!httpRequest.complete) {
      console.log('Upload aborted, cleaning up...')

      // Delete the partially uploaded file from the filesystem
      try {
        fs.unlinkSync(getFilePath(file.id))
      } catch (error) {
        console.error('Error deleting partial file:', error)
      }

      // Remove the upload record from the database
      try {
        await prisma?.aiLibraryFile.delete({ where: { id: file.id } })
        console.log(`Deleted database record for file ID: ${file.id}`)
      } catch (error) {
        console.error('Error deleting database record:', error)
      }
    }
  })

  await completeFileUpload(file.id)
  httpResponse.status(200).send('File upload completed successfully')
}
