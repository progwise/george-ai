import { fs } from '../commons'
import { getEntryPath } from '../entry'
import { DocumentManifest, ExtractionManifest, LibraryManifest, WorkspaceManifest } from '../schema'
import { saveEntry } from './save-entry'

export async function createEntry(
  manifest: WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest,
) {
  const entryPath = getEntryPath(manifest)
  await fs.createFolder(entryPath)
  await saveEntry(manifest)
}
