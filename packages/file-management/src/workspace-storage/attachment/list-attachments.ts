import { fs } from '../commons'
import { getAttachmentsPath } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export async function listAttachments(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<string[]> {
  const attachmentsDirectory = getAttachmentsPath(identifier)
  const attachmentFiles = await fs.listFiles(attachmentsDirectory)
  return attachmentFiles
}
