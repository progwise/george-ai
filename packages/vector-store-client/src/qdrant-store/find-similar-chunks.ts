import { VectorStoreChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function findSimilarChunks(parameters: {
  workspaceId: string
  libraryId?: string
  fileId?: string
  extractionMethod?: string | null
  fragment?: number | null
  embeddingModelName: string
  vector: number[]
  topK: number
  maxDistance?: number
}): Promise<{ results: Array<{ chunk: VectorStoreChunk; distance: number }> }> {
  const { workspaceId, libraryId, fileId, extractionMethod, fragment, embeddingModelName, vector, topK, maxDistance } =
    parameters
  const collectionName = getCollectionName(workspaceId)
  const filter = getChunkSelector({ libraryId, fileId, extractionMethod, fragment })

  const searchResult = await qdrantClient.search(collectionName, {
    vector: { name: embeddingModelName, vector },
    limit: topK,
    filter,
    with_payload: true,
    with_vector: false,
    ...(maxDistance !== undefined ? { score_threshold: maxDistance } : {}),
  })

  return {
    results: searchResult.map((result) => ({
      chunk: VectorStoreChunkSchema.parse(result.payload),
      distance: result.score,
    })),
  }
}
