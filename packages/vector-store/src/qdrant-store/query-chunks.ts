import { FileChunk, VectorStoreChunkSchema, VectorStoreChunksSelector } from '../schema'
import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function queryChunks(parameters: {
  workspaceId: string
  selector: VectorStoreChunksSelector
  take: number
  skip: number
}): Promise<{ hitCount: number; chunks: Array<FileChunk> }> {
  const { workspaceId, selector, take, skip } = parameters
  const collectionName = getCollectionName(workspaceId)
  const filter = getChunkSelector(selector)

  const [data, count] = await Promise.all([
    qdrantClient.scroll(collectionName, {
      filter,
      limit: take,
      offset: skip,
      with_payload: true,
      with_vector: false,
    }),
    qdrantClient.count(collectionName, { filter }),
  ])

  return {
    hitCount: count.count,
    chunks: data.points
      .map((point) => VectorStoreChunkSchema.parse(point.payload))
      .map((chunk) => ({
        ...chunk,
        embeddingModelNames: [],
      })),
  }
}
