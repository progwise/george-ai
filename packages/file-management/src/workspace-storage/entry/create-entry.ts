import { fs } from '../commons'
import { getEntryPath } from '../entry'
import { DocumentManifest, ExtractionManifest, LibraryManifest, WorkspaceManifest } from '../schema'
import { saveEntry } from './save-entry'

export async function createEntry(manifest: WorkspaceManifest): Promise<WorkspaceManifest>
export async function createEntry(manifest: LibraryManifest): Promise<LibraryManifest>
export async function createEntry(manifest: DocumentManifest): Promise<DocumentManifest>
export async function createEntry(manifest: ExtractionManifest): Promise<ExtractionManifest>
export async function createEntry(
  manifest: WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest>
export async function createEntry(
  manifest: WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest,
): Promise<WorkspaceManifest | LibraryManifest | DocumentManifest | ExtractionManifest> {
  const entryPath = getEntryPath(manifest)
  await fs.createFolder(entryPath)
  return await saveEntry(manifest)
}
