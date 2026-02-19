import { getEntryOrThrow, saveEntry } from '../entry'
import { DocumentManifest, ExtractionManifest, LibraryManifest, StorageStats, WorkspaceManifest } from '../schema'
import { addStorageStats } from './add-storage-stats'
import { sanitizeStorageStats } from './sanitize-storage-stats'
import { subtractStorageStats } from './subtract-storage-stats'

export async function updateStats(
  manifest: WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest,
  parameters: {
    stats: StorageStats
    operation?: 'add' | 'subtract' | 'set'
  },
): Promise<void> {
  const { stats, operation } = parameters

  const oldStats = manifest.storageStats
  const newStats = sanitizeStorageStats(
    !operation
      ? stats
      : operation !== 'subtract'
        ? addStorageStats([oldStats, stats])
        : subtractStorageStats(oldStats, stats),
  )

  const savePromises: Promise<unknown>[] = []

  savePromises.push(
    saveEntry({
      ...manifest,
      storageStats: newStats,
    }),
  )

  switch (manifest.type) {
    case 'extraction':
      {
        const fileManifest = await getEntryOrThrow({ ...manifest, type: 'document' })
        savePromises.push(
          saveEntry({
            ...fileManifest,
            storageStats: newStats,
          }),
        )
      }
      break
    case 'document':
      {
        const libraryManifest = await getEntryOrThrow({ ...manifest, type: 'library' })
        savePromises.push(
          saveEntry({
            ...libraryManifest,
            storageStats: newStats,
          }),
        )
      }
      break
    case 'library':
      {
        const workspaceManifest = await getEntryOrThrow({ ...manifest, type: 'workspace' })
        savePromises.push(
          saveEntry({
            ...workspaceManifest,
            storageStats: newStats,
          }),
        )
      }
      break
  }

  await Promise.all(savePromises)
}
