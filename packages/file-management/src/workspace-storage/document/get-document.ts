import { getEntry, getEntryOrThrow } from '../entry'
import { DocumentIdentifier, DocumentManifest } from '../schema'

export async function getDocument(
  identifier: Omit<DocumentIdentifier, 'type' | 'version'>,
): Promise<DocumentManifest | null> {
  const manifest = await getEntry({ ...identifier, type: 'document', version: 1 })
  return manifest
}

export async function getDocumentOrThrow(
  identifier: Omit<DocumentIdentifier, 'type' | 'version'>,
): Promise<DocumentManifest> {
  const manifest = await getEntryOrThrow({ ...identifier, type: 'document', version: 1 })
  return manifest
}
