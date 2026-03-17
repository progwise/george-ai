import { ExtractionMethod } from '@george-ai/app-schema'
import { DocumentChunk, vectorStore } from '@george-ai/vector-store'

export async function* readChunks(params: {
  workspaceId: string
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
}): AsyncIterable<DocumentChunk[]> {
  const { workspaceId, libraryId, documentId, extractionMethod } = params

  for await (const chunk of vectorStore.readChunks({ workspaceId, libraryId, documentId, extractionMethod })) {
    yield chunk
  }
}
