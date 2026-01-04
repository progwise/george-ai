import { LibraryManifest } from '../../schemas'
import { createLibraryDir, getWorkspaceDir } from './directories'
import { saveLibraryManifest } from './metadata-files'

export async function createLibrary(workspaceId: string, libraryId: string, name: string): Promise<LibraryManifest> {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  const libraryDir = await createLibraryDir(workspaceDir, libraryId)
  const manifest: LibraryManifest = {
    version: 1,
    id: libraryId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {},
    usage: {
      activeBytes: 0,
      physicalBytes: 0,
      totalFileCount: 0,
      lastUpdated: new Date().toISOString(),
      activeFileCount: 0,
      integrityState: 'healthy',
    },
  }
  await saveLibraryManifest(libraryDir, manifest)
  return manifest
}
