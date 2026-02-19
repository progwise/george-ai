import { ExtractionMethod } from '@george-ai/app-commons'
import { extraction } from '@george-ai/file-management'

export async function readExtraction(
  workspaceId: string,
  params: { libraryId: string; documentId: string; extractionMethod: ExtractionMethod; fragment?: number },
): Promise<AsyncIterable<string>> {
  const { libraryId, documentId, extractionMethod, fragment } = params

  const extractionStream = await extraction.read(workspaceId, {
    libraryId,
    documentId,
    extractionMethod,
    fragment,
  })

  return extractionStream
}
