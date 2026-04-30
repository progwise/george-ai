import { fs } from '../commons'
import { getEntryPath } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { getBackupFolderName } from './backup-folder-name'
import { BackupInfo } from './backup-info'
import { getBackupsPath } from './get-backups-path'

export const getBackupInfo = async (
  identifier: WorkspaceIdentifier | DocumentIdentifier | LibraryIdentifier | ExtractionIdentifier,
  parameters?: { timestamp?: number },
): Promise<BackupInfo> => {
  const entryPath = getEntryPath(identifier)
  const backupsPath = getBackupsPath(identifier)
  const timestamp = !parameters?.timestamp ? Date.now() : parameters.timestamp
  const folderName = getBackupFolderName(identifier, timestamp)
  const backupPath = fs.getFolderPath(backupsPath, folderName)

  const [entryExists, backupExists] = await Promise.all([fs.existsFolder(entryPath), fs.existsFolder(backupPath)])

  const backupInfo: BackupInfo = {
    identifier,
    timestamp,
    entryPath,
    entryExists,
    backupPath,
    backupExists,
  }

  return backupInfo
}
