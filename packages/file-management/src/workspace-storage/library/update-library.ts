import { getEntryOrThrow, saveEntry } from '../entry'
import { LibraryIdentifier, LibraryManifest } from '../schema'

export async function updateLibrary(identifier: LibraryIdentifier, args: { name: string }): Promise<void> {
  const existingManifest = await getEntryOrThrow(identifier)

  const updatedManifest: LibraryManifest = {
    ...existingManifest,
    name: args.name,
    updated: new Date().toISOString(),
  }
  await saveEntry(updatedManifest)
}
