import { VectorStoreChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunks(parameters: {
  workspaceId: string
  libraryId: string
  fileId?: string
  extractionMethod?: string | null
  take: number
  skip: number
}): Promise<(VectorStoreChunk & { embeddingModelNames: string[] })[]> {
  const { workspaceId, libraryId, fileId, extractionMethod, take, skip } = parameters
  const collectionName = getCollectionName(workspaceId)

  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod })

  const points = await qdrantClient.scroll(collectionName, {
    filter: filterConditions,
    limit: take,
    offset: skip,
    with_payload: true,
    with_vector: true,
  })
  return points.points.map((point) => {
    const embeddingModelNames = point.vector ? Object.keys(point.vector) : []
    return {
      embeddingModelNames,
      ...VectorStoreChunkSchema.parse(point.payload),
    }
  })
}
