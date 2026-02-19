import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export interface BackupInfo {
  identifier: WorkspaceIdentifier | DocumentIdentifier | LibraryIdentifier | ExtractionIdentifier
  timestamp: number
  entryPath: string
  entryExists: boolean
  backupPath: string
  backupExists: boolean
}
