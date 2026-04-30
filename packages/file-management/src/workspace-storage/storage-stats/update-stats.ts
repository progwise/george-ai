import { logger } from '../commons'
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

  logger.debug('Updating storage stats for entry', {
    type: manifest.type,
    id:
      manifest.type === 'workspace'
        ? manifest.workspaceId
        : manifest.type === 'library'
          ? manifest.libraryId
          : manifest.type === 'document'
            ? manifest.documentId
            : `${manifest.documentId}-${manifest.extractionMethod}`,
    oldStats,
    stats,
    newStats,
    operation,
  })

  await saveEntry({ ...manifest, storageStats: newStats })

  switch (manifest.type) {
    case 'extraction':
      {
        const fileManifest = await getEntryOrThrow({ ...manifest, type: 'document' })
        await updateStats(fileManifest, parameters)
      }
      break
    case 'document':
      {
        const libraryManifest = await getEntryOrThrow({ ...manifest, type: 'library' })
        await updateStats(libraryManifest, parameters)
      }
      break
    case 'library':
      {
        const workspaceManifest = await getEntryOrThrow({ ...manifest, type: 'workspace' })
        await updateStats(workspaceManifest, parameters)
      }
      break
  }
}
