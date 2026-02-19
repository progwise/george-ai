import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'

import { DocumentIdentifier } from '../..'
import { fs } from '../commons'
import { logger } from '../commons'
import { getSourcePath } from './get-source-path'
import { getSourceSize } from './get-source-size'

export async function readSourceEx(
  workspaceId: string,
  params: { libraryId: string; documentId: string },
): Promise<{ stream: Readable; fileSize: number }> {
  return readSource({ workspaceId, ...params, version: 1, type: 'document' })
}

export async function readSource(identifier: DocumentIdentifier): Promise<{ stream: Readable; fileSize: number }> {
  const sourcePath = getSourcePath(identifier)
  const existsSourcePath = await fs.existsFile(sourcePath)
  if (!existsSourcePath) {
    logger.warn('Source file does not exist', identifier)
    return { stream: Readable.from([]), fileSize: 0 }
  }
  const sourceSize = await getSourceSize(identifier)
  if (sourceSize.diskSize === 0) {
    logger.warn('Source file is empty', identifier)
    return { stream: Readable.from([]), fileSize: 0 }
  }

  // 3. Return the stream
  const fileStream = createReadStream(sourcePath)

  // 3. Handle stream-level errors (e.g., file system disconnects mid-read)
  fileStream.on('error', (error) => {
    logger.error('Stream error for file', { ...identifier, error })
  })

  fileStream.on('open', () => {
    logger.debug('Stream opened for file', { ...identifier })
  })

  fileStream.on('close', () => {
    logger.debug('Stream closed for file', { ...identifier })
  })

  fileStream.on('end', () => {
    logger.debug('Stream ended for file', { ...identifier })
  })

  return { stream: fileStream, fileSize: sourceSize.diskSize }
}
