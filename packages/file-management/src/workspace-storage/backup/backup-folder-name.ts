import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../..'
import { getEntryId } from '../entry'

export function getBackupFolderName(
  identifier: WorkspaceIdentifier | DocumentIdentifier | LibraryIdentifier | ExtractionIdentifier,
  timestamp: number,
): string {
  const id = getEntryId(identifier)

  return `${id}_${timestamp}`
}

export function parseBackupFolderName(folderName: string): { id: string; timestamp: number } | null {
  const match = folderName.match(/^(.*)_(\d+)$/)
  if (!match) {
    return null
  }
  const [, id, timestampStr] = match
  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) {
    return null
  }
  return { id, timestamp }
}
