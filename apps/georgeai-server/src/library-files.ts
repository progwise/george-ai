import { Request, Response } from 'express'
import fs from 'node:fs'
import path from 'node:path'

import { getFileDir } from '@george-ai/file-management'
import { canAccessFileOrThrow } from '@george-ai/pothos-graphql'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

import { getUserContext } from './getUserContext'

export const libraryFiles = async (request: Request, response: Response) => {
  const { libraryId, fileId } = request.params
  const fileName = request.query['filename'] as string

  const context = await getUserContext(() => ({
    jwtToken: request.headers['x-user-jwt']?.toString() || request.cookies['keycloak-token'] || null,
    bearerToken: request.headers['authorization']?.toString().startsWith('Bearer ')
      ? request.headers['authorization'].toString().substring(7)
      : null,
  }))

  if (!context.session?.user) {
    response.status(401).end()
    return
  }

  try {
    const fileInfo = await canAccessFileOrThrow(fileId, context.session.user.id)
    const libraryFilePath = getFileDir({ libraryId, fileId, errorIfNotExists: true })
    const fileNames = await fs.promises.readdir(libraryFilePath)

    if (!fileName) {
      response.json(fileNames).end()
      return
    }

    if (!fileNames.some((name) => name === fileName)) {
      response.status(404).end()
      return
    }

    // Get the full file path
    const fullFilePath = path.join(libraryFilePath, fileName)

    // Check if file exists and is readable
    try {
      await fs.promises.access(fullFilePath, fs.constants.R_OK)
    } catch (error) {
      console.warn(`File not readable: ${fullFilePath}`, error)
      response.status(404).end()
      return
    }

    // Get file stats for size and content type determination
    const stats = await fs.promises.stat(fullFilePath)
    let mimeType = getMimeTypeFromExtension(fileName)
    let downloadFilename = fileName
    if (fileName === 'upload') {
      downloadFilename = fileInfo.name
      mimeType = fileInfo.mimeType || 'application/octet-stream'
    }

    // Set appropriate headers
    response.setHeader('Content-Type', mimeType)
    response.setHeader('Content-Length', stats.size)
    response.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`)

    // For text files, set charset
    if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
      response.setHeader('Content-Type', `${mimeType}; charset=utf-8`)
    }

    // Stream the file content
    const fileStream = fs.createReadStream(fullFilePath)
    fileStream.pipe(response)

    fileStream.on('error', (error) => {
      console.error(`Error streaming file ${fullFilePath}:`, error)
      if (!response.headersSent) {
        response.status(500).end()
      }
    })
  } catch (error) {
    console.warn(`Error reading library file contents ${libraryId}/${fileId}/${fileName}`, error)
    response.status(404).end()
  }
}
