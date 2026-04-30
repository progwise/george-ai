import { document } from '@george-ai/file-management'

export async function readSource(
  workspaceId: string,
  params: { libraryId: string; documentId: string },
): Promise<{ stream: NodeJS.ReadableStream; fileSize: number }> {
  const { libraryId, documentId } = params

  const { stream, fileSize } = await document.readSource(workspaceId, {
    libraryId,
    documentId,
  })

  return { stream, fileSize }
}
