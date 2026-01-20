import { LibraryManifest } from '../../schemas'
import { createLibraryDir, getWorkspaceDir } from './directories'
import { saveLibraryManifest } from './metadata-files'

export async function createLibrary(
  workspaceId: string,
  args: { libraryId: string; name: string },
): Promise<LibraryManifest> {
  const { libraryId, name } = args
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
      sourceBytes: 0,
      extractedBytes: 0,
      physicalBytes: 0,
      sourceFiles: 0,
      extractionFiles: 0,
      physicalFiles: 0,
      extractions: 0,
      activeExtractions: 0,
      activeExtractedBytes: 0,
      lastUpdate: new Date().toISOString(),
    },
  }
  await saveLibraryManifest(libraryDir, manifest)
  return manifest
}
