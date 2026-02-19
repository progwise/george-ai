import { DocumentManifest, document } from '@george-ai/file-management'

import { DomainError } from '../error'

export async function getDocumentManifest(
  workspaceId: string,
  parameters: { libraryId: string; documentId: string },
): Promise<DocumentManifest> {
  const manifest = await document.get(workspaceId, { ...parameters })
  if (!manifest) {
    throw new DomainError('Document not found', 'document')
  }
  return manifest
}
