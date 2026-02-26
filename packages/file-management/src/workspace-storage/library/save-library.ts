import { getEntryOrThrow, saveEntry } from '../entry'
import { LibraryManifest } from '../schema'

export async function saveLibrary(
  identifier: { workspaceId: string; libraryId: string },
  data: Partial<Omit<LibraryManifest, 'libraryId' | 'workspaceId'>>,
): Promise<void> {
  const existingManifest = await getEntryOrThrow({ ...identifier, version: 1, type: 'library' })
  const updatedManifest: LibraryManifest = {
    ...existingManifest,
    ...data,
    updated: new Date(),
  }
  await saveEntry(updatedManifest)
}
