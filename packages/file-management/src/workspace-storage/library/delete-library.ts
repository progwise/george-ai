import { getEntryOrThrow, getEntryPath } from '../entry'
import { updateStats } from '../storage-stats'

import { rm } from 'fs/promises'

export async function deleteLibrary(workspaceId: string, parameters: { libraryId: string }): Promise<void> {
  const { libraryId } = parameters

  const workspaceManifest = await getEntryOrThrow({ version: 1, workspaceId, type: 'workspace' })

  const libraryManifest = await getEntryOrThrow({ version: 1, workspaceId, libraryId, type: 'library' })

  const libraryPath = getEntryPath(libraryManifest)
  await rm(libraryPath, { recursive: true, force: true })

  await updateStats(workspaceManifest, {
    stats: libraryManifest.storageStats,
    operation: 'subtract',
  })
}
