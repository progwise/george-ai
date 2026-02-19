import { logger } from '../commons'
import { createEntry, entryExists } from '../entry'
import { StorageStatsSchema } from '../schema'
import { LibraryManifest } from '../schema'

export async function createLibrary(
  workspaceId: string,
  args: { libraryId: string; name: string; creator?: string },
): Promise<LibraryManifest> {
  const { libraryId, name, creator } = args

  const libraryExists = await entryExists({ workspaceId, libraryId, type: 'library', version: 1 })
  if (libraryExists) {
    logger.error('Library with same id already exists in workspace', { workspaceId, libraryId })
    throw new Error(`Library with id ${libraryId} already exists in workspace ${workspaceId}`)
  }

  const manifest: LibraryManifest = {
    version: 1,
    libraryId,
    name,
    created: new Date().toISOString(),
    storageStats: StorageStatsSchema.parse({}),
    workspaceId,
    attachments: [],
    creator,
    type: 'library',
  }
  await createEntry(manifest)
  return manifest
}
