import { promises } from 'node:fs'

import { LibraryIdentifier, LibraryManifest, WorkspaceIdentifier } from '../..'
import { fs } from '../commons'
import { logger } from '../commons'
import { getEntryOrThrow, getEntryPath, saveEntry } from '../entry'
import { updateStats } from '../storage-stats'

const { rename } = promises

export async function moveLibrary(
  libraryIdentifier: LibraryIdentifier,
  targetWorkspace: WorkspaceIdentifier,
): Promise<LibraryManifest> {
  const oldLibraryManifest = await getEntryOrThrow(libraryIdentifier)
  const sourceWorkspaceManifest = await getEntryOrThrow({ ...libraryIdentifier, type: 'workspace' })
  const targetWorkspaceManifest = await getEntryOrThrow(targetWorkspace)

  const fromLibraryPath = getEntryPath(libraryIdentifier)
  const toLibraryPath = getEntryPath({ ...libraryIdentifier, workspaceId: targetWorkspace.workspaceId })

  const existsTargetPath = await fs.existsFolder(toLibraryPath)
  if (existsTargetPath) {
    logger.error('Cannot move library because target path already exists', { toLibraryPath })
    throw new Error(`Cannot move library because target path already exists: ${toLibraryPath}`)
  }

  await rename(fromLibraryPath, toLibraryPath)

  await updateStats(sourceWorkspaceManifest, {
    stats: oldLibraryManifest.storageStats,
    operation: 'subtract',
  })

  await updateStats(targetWorkspaceManifest, {
    stats: oldLibraryManifest.storageStats,
    operation: 'add',
  })

  const updatedLibraryManifest: LibraryManifest = {
    ...oldLibraryManifest,
    workspaceId: targetWorkspace.workspaceId,
    updated: new Date().toISOString(),
  }

  return await saveEntry(updatedLibraryManifest)
}
