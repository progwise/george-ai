import { LibraryManifest, library } from '@george-ai/file-management'

import { DomainError } from '../error'

export async function getLibraryManifest(
  workspaceId: string,
  parameters: { libraryId: string },
): Promise<LibraryManifest> {
  const libraryManifest = await library.get(workspaceId, parameters)
  if (!libraryManifest) {
    throw new DomainError('Library not found', 'library')
  }
  return libraryManifest
}
