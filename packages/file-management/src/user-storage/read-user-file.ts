import { Readable } from 'node:stream'

import { getFilePath, readFile } from '../file-system'
import { logger } from './commons'
import { getUserPath } from './get-user-path'

export async function readUserFile(
  userId: string,
  parameters: { fileName: string },
): Promise<{ stream: Readable; size: number; mimeType: string; fileName: string } | null> {
  const { fileName } = parameters
  const userFolderPath = await getUserPath(userId)
  const filePath = getFilePath(userFolderPath, fileName)

  const readFileResult = await readFile(filePath)
  if (!readFileResult) {
    logger.warn(`User file not found`, { userId, fileName })
    return null
  }

  const { stream, size, mimeType } = readFileResult
  stream.on('error', (err) => {
    logger.error(`Error reading user file`, { userId, error: err })
  })
  return { stream, size, mimeType, fileName }
}
