import { LibraryManifest } from '../../schemas'
import { getLibraryDir } from './directories'
import { getLibraryManifest, saveLibraryManifest } from './metadata-files'

export async function updateLibrary(
  workspaceId: string,
  args: {
    libraryId: string
    updates: Partial<LibraryManifest>
  },
): Promise<void> {
  const { libraryId, updates } = args
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  const manifest = await getLibraryManifest(libraryDir)
  if (!manifest) {
    throw new Error(`Library manifest not found for library dir: ${libraryDir}`)
  }
  const updatedManifest: LibraryManifest = {
    ...manifest,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await saveLibraryManifest(libraryDir, updatedManifest)
}
