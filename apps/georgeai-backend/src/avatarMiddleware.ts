import type { Request, Response } from 'express'
import fs from 'fs'

import { isProviderAvatar } from '@george-ai/pothos-graphql'
import { checkUser, getUserAvatarsPath, updateUserAvatarUrl } from '@george-ai/pothos-graphql'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

const allowedFileTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']

export const avatarMiddleware = async (httpRequest: Request, httpResponse: Response) => {
  const userId = httpRequest.query.userId as string
  if (!userId) {
    httpResponse.status(400).send('Bad Request: userId query parameter is required')
    return
  }

  const user = await checkUser(userId)
  if (!user) {
    httpResponse.status(404).send('Not Found: user not found')
    return
  }

  const avatarsPath = getUserAvatarsPath()

  if (httpRequest.method.toUpperCase() === 'GET') {
    const userFiles = fs
      .readdirSync(avatarsPath)
      .filter((file) => file.startsWith(userId) && allowedFileTypes.some((type) => file.endsWith(`.${type}`)))

    if (userFiles.length < 1) {
      httpResponse.status(404).send('Not Found: avatar not found')
      return
    }
    const avatar = fs.createReadStream(`${avatarsPath}/${userFiles[0]}`)
    const mimeType = getMimeTypeFromExtension(userFiles[0])
    httpResponse.contentType(mimeType)
    avatar.pipe(httpResponse)
    httpResponse.status(200)
    return
  }

  if (httpRequest.method.toUpperCase() === 'DELETE') {
    // Check if current avatar is from a provider - if so, don't allow deletion
    if (user.avatarUrl && isProviderAvatar(user.avatarUrl)) {
      httpResponse.status(400).send('Bad Request: Cannot remove provider avatar')
      return
    }

    const userFiles = fs.readdirSync(avatarsPath).filter((file) => file.startsWith(userId))
    userFiles.forEach((file) => {
      fs.rmSync(`${avatarsPath}/${file}`)
    })
    // Clear avatar URL in database
    await updateUserAvatarUrl({
      userId,
      avatarUrl: null,
    })
    httpResponse.status(200).send('OK')
    return
  }

  if (httpRequest.headers['content-type'] === 'multipart/form-data') {
    httpResponse.status(400).send('Bad Request: Multipart form data not supported')
    return
  }

  const fileExtension = httpRequest.headers['x-file-extension'] as string

  if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
    httpResponse
      .status(400)
      .send(`Bad Request: x-file-extension header is required and must be one of ${allowedFileTypes.join(', ')}`)
    return
  }

  const existingFiles = fs.readdirSync(avatarsPath).filter((file) => file.startsWith(userId))

  if (existingFiles.length > 0) {
    existingFiles.forEach((file) => {
      fs.rmSync(`${avatarsPath}/${file}`)
    })
  }
  const filestream = fs.createWriteStream(`${avatarsPath}/${userId}.${fileExtension}`, {
    flags: 'a',
  })

  filestream.on('error', (error) => {
    console.error(error)
    httpResponse.statusCode = 400
    httpResponse.write(JSON.stringify({ status: 'error in filestream', description: error }))
    httpResponse.end()
  })

  httpRequest.pipe(filestream)

  httpRequest.on('end', async () => {
    // Update the database first before responding
    const timestamp = Date.now()
    await updateUserAvatarUrl({
      userId,
      avatarUrl: `${process.env.BACKEND_PUBLIC_URL}/avatar?userId=${userId}&updated=${timestamp}`,
    })

    filestream.close(() => {
      httpResponse.end(JSON.stringify({ status: 'success' }))
    })
  })
}
