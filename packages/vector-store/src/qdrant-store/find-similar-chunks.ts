import { ExtractionMethod } from '@george-ai/app-schema'

import { DocumentChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function findSimilarChunks(parameters: {
  workspaceId: string
  libraryId?: string | null
  documentId?: string | null
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  modelName: string
  vector: number[]
  topK: number
  maxDistance?: number
}): Promise<Array<DocumentChunk & { distance: number }>> {
  const { workspaceId, libraryId, documentId, extractionMethod, fragment, modelName, vector, topK, maxDistance } =
    parameters
  const collectionName = getCollectionName(workspaceId)
  const filter = getChunkSelector({ libraryId, documentId, extractionMethod, fragment })

  const searchResult = await qdrantClient.search(collectionName, {
    vector: { name: modelName, vector },
    limit: topK,
    filter,
    with_payload: true,
    with_vector: false,
    ...(maxDistance !== undefined ? { score_threshold: maxDistance } : {}),
  })

  return searchResult.map((result) => ({
    ...VectorStoreChunkSchema.parse(result.payload),
    embeddingModelNames: result.vector ? Object.keys(result.vector) : [],
    distance: result.score,
  }))
}
