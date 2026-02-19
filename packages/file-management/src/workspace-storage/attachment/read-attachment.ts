import { createReadStream } from 'fs'
import path from 'node:path'
import { Readable } from 'stream'

import { fs, getUri } from '../commons'
import { logger } from '../commons'
import { entryExists, getAttachmentsPath } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export async function readAttachment(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  attachmentFileName: string,
): Promise<Readable> {
  const exists = await entryExists(identifier)
  if (!exists) {
    logger.error('Extraction does not exist', {
      ...identifier,
      attachmentFileName,
    })
    throw new Error(
      `Cannot read attachment. Entry does not exist for the attachment: ${getUri(identifier)}. Attachment file name: ${attachmentFileName}`,
    )
  }
  const attachmentsDir = getAttachmentsPath(identifier)
  const attachmentFilePath = path.join(attachmentsDir, attachmentFileName)

  const attachmentFileExists = await fs.existsFile(attachmentFilePath) // Ensure attachments directory exists before trying to read the file
  if (!attachmentFileExists) {
    logger.error('Attachments directory does not exist for extraction', {
      ...identifier,
      attachmentFileName,
    })
    throw new Error(
      `Cannot read attachment. Attachments directory does not exist for the entry: ${getUri(identifier)}. Attachment file name: ${attachmentFileName}`,
    )
  }
  return createReadStream(attachmentFilePath)
}
