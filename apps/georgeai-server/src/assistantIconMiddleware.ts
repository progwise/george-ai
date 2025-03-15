import { Request, Response } from 'express'
import * as fs from 'fs'

import { checkAssistant, getAssistantIconsPath } from '@george-ai/pothos-graphql'

export const assistantIconMiddleware = async (httpRequest: Request, httpResponse: Response) => {
  const assistantId = httpRequest.query['assistantId'] as string

  if (!assistantId) {
    httpResponse.status(400).send('Bad Request: assistantId is required')
    return
  }

  const assistant = await checkAssistant(assistantId)

  if (!assistant) {
    httpResponse.status(404).send('Not Found: assistant not found')
    return
  }

  const assistantIconsPath = getAssistantIconsPath()

  if (httpRequest.method.toUpperCase() === 'GET') {
    const assistantFiles = fs
      .readdirSync(assistantIconsPath)
      .filter(
        (file) =>
          file.startsWith(assistantId) &&
          (file.endsWith('.png') ||
            file.endsWith('.svg') ||
            file.endsWith('.jpg') ||
            file.endsWith('.jpeg') ||
            file.endsWith('.webp') ||
            file.endsWith('.gif')),
      )

    if (assistantFiles.length < 1) {
      httpResponse.status(404).send('Not Found: icon not found')
      return
    }
    const icon = fs.createReadStream(`${assistantIconsPath}/${assistantFiles[0]}`)
    let fileType = assistantFiles[0].split('.').pop()
    if (fileType?.endsWith('svg')) {
      fileType = 'svg+xml'
    }
    httpResponse.contentType(`image/${fileType}`)
    icon.pipe(httpResponse)
    httpResponse.status(200)
    return
  }

  if (httpRequest.method.toUpperCase() === 'DELETE') {
    const assistantFiles = fs.readdirSync(assistantIconsPath).filter((file) => file.startsWith(assistantId))
    assistantFiles.forEach((file) => {
      fs.rmSync(`${assistantIconsPath}/${file}`)
    })
    httpResponse.status(200).send('OK')
    return
  }

  if (httpRequest.headers['content-type'] === 'multipart/form-data') {
    httpResponse.status(400).send('Bad Request: Multipart form data not supported')
    return
  }

  const fileExtension = httpRequest.headers['x-file-extension'] as string

  if (!fileExtension || !['png', 'svg', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
    httpResponse
      .status(400)
      .send('Bad Request: x-file-extension header is required and must be one of png, svg, jpg, jpeg, gif, webp')
    return
  }

  const existingFiles = fs.readdirSync(assistantIconsPath).filter((file) => file.startsWith(assistantId))

  if (existingFiles.length > 0) {
    existingFiles.forEach((file) => {
      fs.rmSync(`${assistantIconsPath}/${file}`)
    })
  }
  const filestream = fs.createWriteStream(`${assistantIconsPath}/${assistantId}.${fileExtension}`, {
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
}
