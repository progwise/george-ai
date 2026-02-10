import { createReadStream } from 'node:fs'
import { constants, promises } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

import { SOURCE_FILE_NAME, isNodeError, logger } from './commons'
import { getFileDir } from './directories'

const { access } = promises

export async function readSource(
  workspaceId: string,
  args: { libraryId: string; fileId: string },
): Promise<{ stream: Readable; fileSize: number }> {
  const { libraryId, fileId } = args
  const fileDir = getFileDir(workspaceId, libraryId, fileId)
  const filePath = path.join(fileDir, SOURCE_FILE_NAME)

  try {
    // 1. Verify readability before opening the stream
    // R_OK checks if the file exists AND the process has read permissions
    await access(filePath, constants.R_OK)
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      throw new Error(`Source file not found at ${filePath}`)
    }
    throw err
  }

  // 2. Get actual file size from filesystem
  const fileStats = await promises.lstat(filePath)

  // 3. Return the stream
  const fileStream = createReadStream(filePath)

  // 3. Handle stream-level errors (e.g., file system disconnects mid-read)
  fileStream.on('error', (error) => {
    logger.error('Stream error for file', { fileId, libraryId, workspaceId, error: error })
  })

  fileStream.on('open', () => {
    logger.debug('Stream opened for file', { fileId, libraryId, workspaceId })
  })

  fileStream.on('close', () => {
    logger.debug('Stream closed for file', { fileId, libraryId, workspaceId })
  })

  fileStream.on('end', () => {
    logger.debug('Stream ended for file', { fileId, libraryId, workspaceId })
  })

  return { stream: fileStream, fileSize: fileStats.size }
}
