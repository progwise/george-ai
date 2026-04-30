import { document } from '@george-ai/file-management'

export async function getSourceHash(
  workspaceId: string,
  params: { libraryId: string; documentId: string },
): Promise<string> {
  const { libraryId, documentId } = params

  const sourceHash = await document.calculateSourceHash({
    workspaceId,
    libraryId,
    documentId,
    type: 'document',
    version: 1,
  })

  return sourceHash
}
