import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { fs, logger } from '../commons'
import { getAttachmentsPath, getEntry, saveEntry } from '../entry'
import { Attachment, DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { updateStats } from '../storage-stats'

/**
 * Write an attachment stream to disk
 * Existing attachment with the same name will be overwritten, backup first
 */
export async function writeAttachment(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  parameters: {
    attachmentFileName: string
    mimeType: string
    stream: Readable
  },
): Promise<Attachment> {
  const attachmentsDir = getAttachmentsPath(identifier)
  await mkdir(attachmentsDir, { recursive: true })

  const { attachmentFileName, mimeType, stream } = parameters

  const attachmentFilePath = fs.getFilePath(attachmentsDir, attachmentFileName)

  await fs.deleteFile(attachmentFilePath)
  const writer = createWriteStream(attachmentFilePath)
  let size = 0

  await pipeline(
    stream,
    async function* (source) {
      for await (const chunk of source) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        size += buf.length
        yield buf
      }
    },
    writer,
  )

  const attachment: Attachment = {
    fileName: attachmentFileName,
    mimeType,
    size,
    createdAt: new Date().toISOString(),
    version: 1,
  }
  const parentEntry = await getEntry(identifier)
  if (!parentEntry) {
    logger.warn(
      'Cannot update parent entry with attachments because it was not found. Normal for extraction stream usage.',
      { identifier },
    )
    return attachment
  }
  parentEntry.attachments = [...(parentEntry.attachments || []), attachment]
  await saveEntry(parentEntry)

  await updateStats(parentEntry, {
    operation: 'add',
    stats: {
      attachmentBytes: size,
      attachmentFileCount: 1,
      extractionBytes: identifier.type === 'extraction' ? size : 0,
      physicalBytes: size,
      extractionFileCount: identifier.type === 'extraction' ? 1 : 0,
      physicalFileCount: 1,
    },
  })
  return attachment
}
