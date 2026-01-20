import { LibraryManifest } from '../../schemas'
import { getLibraryDir } from './directories'
import { exists } from './exists'
import { getLibraryManifest } from './metadata-files'

export async function getLibrary(workspaceId: string, args: { libraryId: string }): Promise<LibraryManifest | null> {
  const { libraryId } = args
  if (!(await exists(workspaceId, { libraryId }))) {
    return null
  }
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  const libraryManifest = await getLibraryManifest(libraryDir)
  if (!libraryManifest) {
    throw new Error(`Library manifest not found for libraryId: ${libraryId} in workspaceId: ${workspaceId}`)
  }
  return libraryManifest
}
