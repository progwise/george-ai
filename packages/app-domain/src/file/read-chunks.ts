import { ExtractionMethod } from '@george-ai/app-commons'
import { FileChunk, vectorStore } from '@george-ai/vector-store'

export async function* readChunks(params: {
  workspaceId: string
  libraryId: string
  fileId: string
  extractionMethod: ExtractionMethod
}): AsyncIterable<FileChunk[]> {
  const { workspaceId, libraryId, fileId, extractionMethod } = params

  for await (const chunk of vectorStore.readChunks({ workspaceId, libraryId, fileId, extractionMethod })) {
    yield chunk
  }
}
