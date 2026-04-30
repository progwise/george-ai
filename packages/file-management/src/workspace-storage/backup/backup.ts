import { cp, mkdir } from 'node:fs/promises'

import { ExtractionIdentifier } from '../schema'
import { DocumentIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { BackupInfo } from './backup-info'
import { getBackupInfo } from './get-backup-info'

export async function backup(
  identifier: WorkspaceIdentifier | DocumentIdentifier | LibraryIdentifier | ExtractionIdentifier,
): Promise<BackupInfo | null> {
  const backupInfo = getBackupInfo(identifier)
  const { entryPath, entryExists, backupPath, backupExists } = await backupInfo
  if (!entryExists) {
    return null
  }
  if (backupExists) {
    throw new Error('Backup already exists for the specified parameters')
  }
  await mkdir(backupPath, { recursive: true })

  await cp(entryPath, backupPath, { recursive: true })
  return backupInfo
}
