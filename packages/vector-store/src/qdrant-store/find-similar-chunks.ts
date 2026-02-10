import { ExtractionMethod } from '@george-ai/app-commons'

import { FileChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function findSimilarChunks(parameters: {
  workspaceId: string
  libraryId?: string | null
  fileId?: string | null
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  modelName: string
  vector: number[]
  topK: number
  maxDistance?: number
}): Promise<Array<FileChunk & { distance: number }>> {
  const { workspaceId, libraryId, fileId, extractionMethod, fragment, modelName, vector, topK, maxDistance } =
    parameters
  const collectionName = getCollectionName(workspaceId)
  const filter = getChunkSelector({ libraryId, fileId, extractionMethod, fragment })

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
