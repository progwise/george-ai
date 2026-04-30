import { createReadStream } from 'fs'
import { Readable } from 'stream'

import { getFilePath } from '../../file-system'
import { fs, getUri } from '../commons'
import { logger } from '../commons'
import { getAttachmentsPath, getEntry } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export async function readAttachment(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  attachmentFileName: string,
): Promise<{ stream: Readable; size: number; mimeType: string }> {
  const parent = await getEntry(identifier)
  if (!parent) {
    logger.error('Entry does not exist', {
      ...identifier,
      attachmentFileName,
    })
    throw new Error(
      `Cannot read attachment. Entry does not exist for the attachment: ${getUri(identifier)}. Attachment file name: ${attachmentFileName}`,
    )
  }
  const attachmentsDir = getAttachmentsPath(identifier)
  const attachmentFilePath = getFilePath(attachmentsDir, attachmentFileName)

  const attachmentStats = await fs.getFileStats(attachmentFilePath) // Ensure attachments directory exists before trying to read the file
  if (!attachmentStats) {
    logger.error('Attachments directory does not exist for entry', {
      ...identifier,
      attachmentFileName,
      attachmentsDir,
      attachmentFilePath,
    })
    throw new Error(
      `Cannot read attachment. Attachments directory does not exist for the entry: ${getUri(identifier)}. Attachment file name: ${attachmentFileName}`,
    )
  }
  const stream = createReadStream(attachmentFilePath)
  const mimeType =
    parent.attachments?.find((att) => att.fileName === attachmentFileName)?.mimeType || 'application/octet-stream'
  return { stream, size: attachmentStats.diskSize, mimeType }
}
