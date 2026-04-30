import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'
import { VectorStoreChunk, vectorStore } from '@george-ai/vector-store'

export async function* readChunks(params: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
}): AsyncIterable<VectorStoreChunk[]> {
  const { workspaceId, modelDriver, modelName, libraryId, documentId, extractionMethod } = params

  for await (const chunk of vectorStore.readChunks({
    workspaceId,
    modelDriver,
    modelName,
    libraryId,
    documentId,
    extractionMethod,
  })) {
    yield chunk
  }
}
