import { getEntryOrThrow } from '../entry'
import { DocumentManifest } from '../schema'

export async function getDocument(
  workspaceId: string,
  args: { libraryId: string; documentId: string },
): Promise<DocumentManifest> {
  const manifest = await getEntryOrThrow({ workspaceId, ...args, version: 1, type: 'document' })
  return manifest
}
