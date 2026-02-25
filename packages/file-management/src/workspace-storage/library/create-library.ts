import { logger } from '../commons'
import { createEntry, entryExists, getEntryOrThrow } from '../entry'
import { StorageStatsSchema } from '../schema'
import { LibraryManifest } from '../schema'
import { updateStats } from '../storage-stats'

export async function createLibrary(
  workspaceId: string,
  args: { libraryId: string; name: string; creator?: string },
): Promise<LibraryManifest> {
  const { libraryId, name, creator } = args

  const workspaceManifest = await getEntryOrThrow({ workspaceId, type: 'workspace', version: 1 })

  const libraryExists = await entryExists({ workspaceId, libraryId, type: 'library', version: 1 })
  if (libraryExists) {
    logger.error('Library with same id already exists in workspace', { workspaceId, libraryId })
    throw new Error(`Library with id ${libraryId} already exists in workspace ${workspaceId}`)
  }

  const manifest: LibraryManifest = {
    version: 1,
    libraryId,
    name,
    created: new Date(),
    storageStats: StorageStatsSchema.parse({}),
    workspaceId,
    attachments: [],
    creator,
    type: 'library',
  }
  const savedLibraryManifest = await createEntry(manifest)

  await updateStats(workspaceManifest, {
    stats: savedLibraryManifest.storageStats,
    operation: 'add',
  })
  return savedLibraryManifest
}
