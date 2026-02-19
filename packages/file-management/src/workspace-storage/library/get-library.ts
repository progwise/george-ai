import { getEntry } from '../entry'
import { LibraryManifest } from '../schema'

export async function getLibrary(workspaceId: string, args: { libraryId: string }): Promise<LibraryManifest | null> {
  const { libraryId } = args
  const manifest = await getEntry({ version: 1, workspaceId, libraryId, type: 'library' })
  return manifest
}
