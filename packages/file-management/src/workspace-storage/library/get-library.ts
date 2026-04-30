import { getEntry } from '../entry'
import { LibraryManifest } from '../schema'

export async function getLibrary(args: { workspaceId: string; libraryId: string }): Promise<LibraryManifest | null> {
  const { workspaceId, libraryId } = args
  const manifest = await getEntry({ version: 1, workspaceId, libraryId, type: 'library' })
  return manifest
}
