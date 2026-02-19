import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { rename, rm } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { logger } from '../commons'
import { getEntryOrThrow, saveEntry } from '../entry'
import { DocumentIdentifier, DocumentManifest } from '../schema'
import { subtractStorageStats, updateStats } from '../storage-stats'
import { getSourcePath } from './get-source-path'
import { getSourceSize } from './get-source-size'

export async function writeSourceEx(
  workspaceId: string,
  params: { libraryId: string; documentId: string; stream: Readable },
): Promise<{
  ack: () => Promise<DocumentManifest>
  nack: (error: Error) => Promise<void>
}> {
  return writeSource({ workspaceId, ...params, type: 'document', version: 1 }, params.stream)
}

export async function writeSource(
  identifier: DocumentIdentifier,
  stream: Readable,
): Promise<{
  ack: () => Promise<DocumentManifest>
  nack: (error: Error) => Promise<void>
}> {
  const libraryManifest = await getEntryOrThrow({ ...identifier, type: 'library' })
  const documentManifest = await getEntryOrThrow(identifier)

  const sourceSize = await getSourceSize(identifier)
  if (sourceSize.diskSize > 0) {
    logger.warn('Overwriting non-empty source file', { ...identifier, sourceSize })
  }

  const sourceFilePath = getSourcePath(identifier)
  const temporaryFileSuffix = `.tmp-${Date.now()}`
  const temporarySourceFilePath = `${sourceFilePath}${temporaryFileSuffix}`

  const hash = createHash('sha256')
  const writeStream = createWriteStream(temporarySourceFilePath)

  let byteCount = 0

  // Pipeline handles the backpressure and closing of streams
  await pipeline(
    stream,
    async function* (source) {
      for await (const chunk of source) {
        byteCount += chunk.length
        hash.update(chunk)
        yield chunk
      }
    },
    writeStream,
  )

  const finalHash = hash.digest('hex')

  const newDocumentManifest: DocumentManifest = {
    ...documentManifest,
    version: 1,
    updated: new Date().toISOString(),
    sourceHash: finalHash,
    storageStats: {
      ...documentManifest.storageStats,
      physicalBytes: documentManifest.storageStats.physicalBytes - sourceSize.diskSize + byteCount,
      physicalFileCount: documentManifest.storageStats.physicalFileCount - (sourceSize.diskSize > 0 ? 1 : 0) + 1,
      lastUpdate: new Date().toISOString(),
    },
  }

  const storageStatsDifference = subtractStorageStats(newDocumentManifest.storageStats, documentManifest.storageStats)
  logger.debug('Storage stats difference for writeSource', { ...identifier, storageStatsDifference })

  const ack = async () => {
    try {
      const [saveResult, ,] = await Promise.all([
        saveEntry(newDocumentManifest),
        rename(temporarySourceFilePath, sourceFilePath),
        updateStats(libraryManifest, {
          stats: storageStatsDifference,
          operation: 'add',
        }),
      ])
      return saveResult
    } catch (error) {
      logger.error('Error in ack for writeSource', { ...identifier, error })
      try {
        await rename(temporarySourceFilePath, `${temporarySourceFilePath}.failed-${Date.now()}`)
      } catch (e) {
        logger.error('Error during ack cleanup in writeSource', { ...identifier, error: e })
      }
      throw error
    }
  }

  const nack = async (error: Error) => {
    logger.error('Error in writeSource, performing nack', { ...identifier, error })
    // Clean up the temporary file if it exists
    try {
      await rm(temporarySourceFilePath).catch((err) => {
        logger.error(`Failed to remove temp source file at ${temporarySourceFilePath}: ${err}`)
      })
    } catch (e) {
      // If the file doesn't exist or can't be renamed, log the error but don't throw
      logger.error('Error during nack cleanup in writeSource', { ...identifier, error: e })
    }
  }

  return { ack, nack }
}
