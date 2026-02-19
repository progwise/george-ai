import { Request, Response } from 'express'

import { checkAssistant, createAssistantIcon, deleteAssistantIcon, readAssistantIcon } from '@george-ai/app-domain'

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

  if (httpRequest.headers['content-type'] === 'multipart/form-data') {
    httpResponse.status(400).send('Bad Request: Multipart form data not supported')
    return
  }

  if (httpRequest.method.toUpperCase() === 'GET') {
    const assistantIcon = await readAssistantIcon(assistantId)
    if (assistantIcon === null || assistantIcon.size === 0) {
      httpResponse.status(404).send('Not Found: icon not found')
      return
    }

    httpResponse.contentType(assistantIcon.mimeType)
    assistantIcon.stream.pipe(httpResponse)
    httpResponse.status(200)
    return
  }

  if (httpRequest.method.toUpperCase() === 'DELETE') {
    await deleteAssistantIcon(assistantId)
    httpResponse.status(200).send('OK')
    return
  }

  const fileExtension = httpRequest.headers['x-file-extension'] as string

  const iconWriteStream = await createAssistantIcon(assistantId, {
    fileName: `icon.${fileExtension}`,
  })

  iconWriteStream.on('error', (error) => {
    console.error(error)
    httpResponse.statusCode = 400
    httpResponse.write(JSON.stringify({ status: 'error in iconWriter', description: error }))
    httpResponse.end()
  })

  httpRequest.pipe(iconWriteStream)

  httpRequest.on('end', async () => {
    iconWriteStream.close(() => {
      httpResponse.end(JSON.stringify({ status: 'success' }))
    })
  })
}
