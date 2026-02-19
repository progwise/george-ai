import { fs } from '../commons'
import { getEntryId } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { parseBackupFolderName } from './backup-folder-name'
import { BackupInfo } from './backup-info'
import { getBackupInfo } from './get-backup-info'
import { getBackupsPath } from './get-backups-path'

export async function backupList(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<BackupInfo[]> {
  const backupsFolderPath = getBackupsPath(identifier)

  const backupFolderNames = await fs.listFolders(backupsFolderPath)

  const id = getEntryId(identifier)

  const backupInfos: Promise<BackupInfo>[] = []
  for (const backupFolderName of backupFolderNames) {
    const parsedBackupId = parseBackupFolderName(backupFolderName)
    if (!parsedBackupId || parsedBackupId.id !== id) {
      continue
    }

    const backupInfo = getBackupInfo(identifier, { timestamp: parsedBackupId.timestamp })
    backupInfos.push(backupInfo)
  }

  const resolvedBackupInfos = await Promise.all(backupInfos)
  return resolvedBackupInfos.sort((a, b) => b.timestamp - a.timestamp)
}
