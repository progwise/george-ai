import { createWriteStream } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'

import { writeAttachment } from '../../attachment'
import { backup, restore } from '../../backup'
import { logger } from '../../commons'
import { getEntry, getEntryOrThrow, getEntryPath, saveEntry } from '../../entry'
import { Attachment, ExtractionManifest } from '../../schema'
import { updateStats } from '../../storage-stats'
import { ExtractionWriter } from './common'
import { writeFragment } from './write-fragment'

/**
 * Extraction writer - writes content to a single output.md file and supports adding fragment streams and attachment streams.
 * On ack, saves the manifest with storage stats. On nack, rolls back any changes.
 */
export async function createExtractionWriter(extractionManifest: ExtractionManifest): Promise<ExtractionWriter> {
  const documentManifest = await getEntryOrThrow({ ...extractionManifest, type: 'document' })

  const oldExtractionManifest = await getEntry(extractionManifest)
  if (oldExtractionManifest) {
    logger.warn('Existing extraction manifest found. This extraction will overwrite it.', {
      ...extractionManifest,
    })
    await updateStats(documentManifest, {
      stats: oldExtractionManifest.storageStats,
      operation: 'subtract',
    })
  }

  const extractionBackup = await backup(extractionManifest)
  if (extractionBackup && extractionBackup.entryExists) {
    await rm(extractionBackup.entryPath, { recursive: true, force: true })
  }

  const extractionDir = getEntryPath(extractionManifest)

  await mkdir(extractionDir, { recursive: true })
  const outputPath = path.join(extractionDir, 'output.md')
  const markdownWriter = createWriteStream(outputPath)
  let markdownBytes = 0
  let isAborted = false
  let fragmentCounter = 0

  const pendingAttachments: Promise<Attachment>[] = []

  const pendingFragments: Promise<{ size: number; fragment: number }>[] = []

  const rollback = async () => {
    await rm(extractionDir, { recursive: true, force: true }).catch(() => {})
    if (extractionBackup && extractionBackup.entryExists) {
      logger.info('Restoring extraction from backup during rollback', {
        ...extractionBackup,
      })
      await restore(extractionManifest, { timestamp: extractionBackup.timestamp }).catch((error) => {
        logger.error('Error during extraction restore in rollback', {
          ...extractionBackup,
          error,
          extractionBackup,
        })
      })
    }
    if (oldExtractionManifest) {
      await updateStats(documentManifest, {
        stats: oldExtractionManifest.storageStats,
        operation: 'add',
      })
    }
  }

  return {
    async write(chunk: string | Buffer): Promise<void> {
      if (isAborted) {
        markdownWriter.destroy()
        throw new Error('Extraction was aborted')
      }
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      markdownBytes += buffer.length

      const canContinue = markdownWriter.write(buffer)
      if (!canContinue) {
        // Pause until the stream has flushed its buffer
        // return once(markdownWriter, 'drain').then(() => {})
        return new Promise((resolve, reject) => {
          markdownWriter.once('drain', resolve)
          markdownWriter.once('error', reject)
        })
      }
    },

    addFragment(stream: Readable) {
      if (isAborted) {
        stream.destroy()
        throw new Error('Extraction was aborted')
      }
      const fragment = 1 + fragmentCounter++
      pendingFragments.push(
        writeFragment(extractionManifest, {
          stream,
          fragment,
        }),
      )
      return fragment
    },

    addAttachment(filename: string, stream: Readable, mimeType: string) {
      if (isAborted) {
        stream.destroy()
        throw new Error('Extraction was aborted')
      }
      pendingAttachments.push(
        writeAttachment(extractionManifest, {
          attachmentFileName: filename,
          stream,
          mimeType: mimeType,
        }),
      )
    },

    async ack(): Promise<ExtractionManifest> {
      if (isAborted) {
        throw new Error('Extraction was aborted')
      }

      try {
        markdownWriter.end()
        await finished(markdownWriter)

        const attachments = await Promise.all(pendingAttachments)
        const totalAttachmentBytes = attachments.reduce((sum, a) => sum + a.size, 0)
        const fragmentResults = await Promise.all(pendingFragments)
        const totalFragmentBytes = fragmentResults.reduce((sum, f) => sum + f.size, 0)
        markdownBytes += totalFragmentBytes

        const manifest: ExtractionManifest = {
          ...extractionManifest,
          storageStats: {
            extractionBytes: markdownBytes,
            physicalBytes: markdownBytes + totalAttachmentBytes,
            extractionFileCount: 1 + fragmentResults.length,
            physicalFileCount: 2 + attachments.length + fragmentResults.length, // 1 for output.md, 1 for manifest, 1 per fragment, 1 per attachment
            attachmentBytes: totalAttachmentBytes,
            attachmentFileCount: attachments.length,
            lastUpdate: new Date().toISOString(),
          },
          fragmentCount: fragmentResults.length,
          attachments,
        }

        // add estimated manifest size to physical bytes to account for manifest growth when saving
        const estimatedManifestSize = Buffer.byteLength(JSON.stringify(manifest))
        manifest.storageStats.physicalBytes += estimatedManifestSize

        await saveEntry(manifest)

        documentManifest.extractions.push({
          extractionMethod: manifest.extractionMethod,
          sourceHash: manifest.sourceHash,
          created: new Date().toISOString(),
        })

        await updateStats(documentManifest, {
          stats: manifest.storageStats,
          operation: 'add',
        })

        return manifest
      } catch (error) {
        logger.error('Error finishing extraction. Rollback.', {
          ...extractionManifest,
          error,
        })
        await rollback().catch((rollbackError) => {
          logger.error('Error during extraction rollback', {
            method: 'ack',
            ...extractionManifest,
            originalError: error,
            rollbackError,
          })
        })
        throw error
      }
    },

    async nack(error?: Error) {
      isAborted = true
      markdownWriter.destroy()
      if (error) {
        logger.error('Extraction aborted', { ...extractionManifest, error })
      }
      await rollback().catch((rollbackError) => {
        logger.error('Error during extraction rollback', {
          method: 'nack',
          ...extractionManifest,
          rollbackError,
        })
      })
    },
  }
}
