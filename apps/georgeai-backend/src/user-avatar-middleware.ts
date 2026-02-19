import type { Request, Response } from 'express'

import { checkUser, createUserAvatar, deleteUserAvatar, readUserAvatar } from '@george-ai/app-domain'

export const userAvatarMiddleware = async (httpRequest: Request, httpResponse: Response) => {
  const userId = httpRequest.query.userId as string
  if (!userId) {
    httpResponse.status(400).send('Bad Request: userId query parameter is required')
    return
  }

  const checkedUser = await checkUser(userId)
  if (!checkedUser) {
    httpResponse.status(404).send('Not Found: user not found')
    return
  }

  if (httpRequest.headers['content-type'] === 'multipart/form-data') {
    httpResponse.status(400).send('Bad Request: Multipart form data not supported')
    return
  }

  if (httpRequest.method.toUpperCase() === 'GET') {
    const userAvatar = await readUserAvatar(userId)
    if (userAvatar === null || userAvatar.size === 0) {
      httpResponse.status(404).send('Not Found: avatar not found')
      return
    }
    httpResponse.contentType(userAvatar.mimeType)
    userAvatar.stream.pipe(httpResponse)
    httpResponse.status(200)
    return
  }

  if (httpRequest.method.toUpperCase() === 'DELETE') {
    // Clear avatar URL in database
    await deleteUserAvatar(userId)
    httpResponse.status(200).send('OK')
    return
  }

  // TODO: POST and Put ??
  const fileExtension = httpRequest.headers['x-file-extension'] as string

  try {
    const avatarWriter = await createUserAvatar(userId, fileExtension)
    avatarWriter.writeStream.on('error', (error) => {
      console.error(error)
      httpResponse.statusCode = 400
      httpResponse.write(JSON.stringify({ status: 'error in filestream', description: error }))
      httpResponse.end()
    })

    httpRequest.pipe(avatarWriter.writeStream)

    httpRequest.on('end', async () => {
      avatarWriter.writeStream.close(() => {
        httpResponse.end(JSON.stringify({ status: 'success' }))
      })
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error occurred while creating avatar write stream'
    httpResponse.status(400).send(`Bad Request: ${errorMessage}`)
    return
  }
}
