import { DocumentManifest, ExtractionManifest, LibraryManifest, WorkspaceManifest } from '../schema'
import { EntryIdentifierSchema } from '../schema/identifier'

export function getEntryIdentifier(
  manifest: WorkspaceManifest | DocumentManifest | LibraryManifest | ExtractionManifest,
) {
  const identifier = EntryIdentifierSchema.parse(manifest)
  return identifier
}
