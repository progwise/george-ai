import { LibraryManifest } from '../../schemas'
import { getLibraryDir } from './directories'
import { getLibraryManifest, saveLibraryManifest } from './metadata-files'

export async function updateLibrary(
  workspaceId: string,
  libraryId: string,
  updates: Partial<LibraryManifest>,
): Promise<void> {
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  const manifest: LibraryManifest = await getLibraryManifest(libraryDir)
  const updatedManifest: LibraryManifest = {
    ...manifest,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await saveLibraryManifest(libraryDir, updatedManifest)
}
