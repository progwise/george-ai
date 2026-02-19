import { fs } from '../commons'
import { entryExists, getEntryPath } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { backup } from './backup'
import { BackupInfo } from './backup-info'
import { backupList } from './backup-list'
import { getBackupsPath } from './get-backups-path'

import { cp, mkdir, rm } from 'fs/promises'

export async function restore(
  identifier: WorkspaceIdentifier | DocumentIdentifier | LibraryIdentifier | ExtractionIdentifier,
  parameters?: { timestamp?: number },
): Promise<BackupInfo> {
  const backupsDir = getBackupsPath(identifier)
  const backupsDirExists = await fs.existsFolder(backupsDir)
  if (!backupsDirExists) {
    throw new Error('No backups found for the specified parameters')
  }

  const backups = await backupList(identifier)
  if (backups.length === 0) {
    throw new Error('No backups found for the specified parameters')
  }

  const backupInfo = parameters?.timestamp
    ? backups.find((backup) => backup.timestamp === parameters.timestamp)
    : backups[0]
  if (!backupInfo) {
    throw new Error('No backup found for the specified timestamp')
  }

  const entryPath = getEntryPath(identifier)
  const targetExists = await entryExists(identifier)
  if (targetExists) {
    await backup(identifier)
    await rm(entryPath, { recursive: true, force: true })
  }

  await mkdir(entryPath, { recursive: true })

  await cp(backupInfo.backupPath, entryPath, { recursive: true })
  return backupInfo
}
