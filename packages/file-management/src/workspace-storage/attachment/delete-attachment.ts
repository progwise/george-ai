import { deleteFile, getFilePath, getFileStats } from '../../file-system'
import { logger } from '../commons'
import { getAttachmentsPath, getEntryOrThrow } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { updateStats } from '../storage-stats'

export async function deleteAttachment(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  parameters: {
    attachmentFileName: string
  },
): Promise<boolean> {
  const { attachmentFileName } = parameters

  const attachmentsDir = getAttachmentsPath(identifier)
  const attachmentFilePath = getFilePath(attachmentsDir, attachmentFileName)
  const attachmentStats = await getFileStats(attachmentFilePath) // Ensure attachments directory exists before trying to read the file
  if (!attachmentStats) {
    logger.warn('Attachments directory does not exist for entry', {
      ...identifier,
      attachmentFileName,
    })
    return false
  }

  const parentManifest = await getEntryOrThrow(identifier)

  parentManifest.attachments = parentManifest.attachments.filter(
    (attachment) => attachment.fileName !== attachmentFileName,
  )

  await updateStats(parentManifest, {
    stats: {
      ...parentManifest.storageStats,
      attachmentFileCount: -1,
      physicalFileCount: -1,
      attachmentBytes: -attachmentStats.diskSize,
      physicalBytes: -attachmentStats.diskSize,
    },
  })

  await deleteFile(attachmentFilePath)
  return true
}
