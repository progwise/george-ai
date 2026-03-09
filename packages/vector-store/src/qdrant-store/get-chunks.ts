import { ExtractionMethod } from '@george-ai/app-schema'

import { FileChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunks(parameters: {
  workspaceId: string
  libraryId: string
  fileId?: string
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  take: number
  skip: number
}): Promise<FileChunk[]> {
  const { workspaceId, libraryId, fileId, extractionMethod, fragment, take, skip } = parameters
  const collectionName = getCollectionName(workspaceId)

  const collectionExists = await qdrantClient.getCollection(collectionName).catch(() => {})
  if (!collectionExists) {
    return []
  }

  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod, fragment })

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
