import { createWriteStream } from 'node:fs'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'

import { writeAttachment } from '../../attachment'
import { backup, restore } from '../../backup'
import { logger } from '../../commons'
import { getEntryPath, saveEntry } from '../../entry'
import { Attachment, ExtractionManifest } from '../../schema'
import { updateStats } from '../../storage-stats'
import { ExtractionWriter } from './common'
import { writeFragment } from './write-fragment'

/**
 * Extraction writer - writes content to a single output.md file and supports adding fragment streams and attachment streams.
 * On ack, saves the manifest with storage stats. On nack, rolls back any changes.
 */
export async function getExtractionWriter(extractionManifest: ExtractionManifest): Promise<ExtractionWriter> {
  const extractionBackup = await backup(extractionManifest)
  if (!extractionBackup) {
    logger.error('Failed to create backup for extraction', { extractionManifest })
    throw new Error('Failed to create backup for extraction')
  }
  const extractionDir = getEntryPath(extractionManifest)

  const outputPath = path.join(extractionDir, 'output.md')
  const markdownWriter = createWriteStream(outputPath, { flags: 'a' })
  let markdownBytes = 0
  let isAborted = false
  let fragmentCounter = 0

  const pendingAttachments: Promise<Attachment>[] = []

  const pendingFragments: Promise<{ size: number; fragment: number }>[] = []

  const rollback = async () => {
    await rm(extractionDir, { recursive: true, force: true }).catch(() => {})
    await restore(extractionManifest, { timestamp: extractionBackup.timestamp }).catch((error) => {
      logger.error('Error during extraction restore in rollback', {
        ...extractionBackup,
        error,
        extractionBackup,
      })
    })
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
            extractionBytes: markdownBytes + extractionManifest.storageStats.extractionBytes,
            physicalBytes: markdownBytes + extractionManifest.storageStats.physicalBytes + totalAttachmentBytes,
            extractionFileCount: fragmentResults.length + extractionManifest.storageStats.extractionFileCount,
            physicalFileCount:
              attachments.length + fragmentResults.length + extractionManifest.storageStats.physicalFileCount, // 1 for output.md, 1 for manifest, 1 per fragment, 1 per attachment
            attachmentBytes: totalAttachmentBytes + extractionManifest.storageStats.attachmentBytes,
            attachmentFileCount: attachments.length + extractionManifest.storageStats.attachmentFileCount,
            lastUpdate: new Date(),
          },
          fragmentCount: fragmentResults.length,
          attachments,
        }

        // add estimated manifest size to physical bytes to account for manifest growth when saving
        const estimatedManifestSize = Buffer.byteLength(JSON.stringify(manifest))
        manifest.storageStats.physicalBytes += estimatedManifestSize

        await saveEntry(manifest)

        await updateStats(extractionManifest, {
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
