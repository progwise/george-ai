import { ExtractionMethod } from '@george-ai/app-schema'

import { DocumentChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, logger, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunks(parameters: {
  workspaceId: string
  libraryId: string
  documentId?: string
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  take: number
  firstChunk?: number
}): Promise<DocumentChunk[]> {
  const { workspaceId, libraryId, documentId, extractionMethod, fragment, take, firstChunk } = parameters
  const collectionName = getCollectionName(workspaceId)

  const collectionExists = await qdrantClient.getCollection(collectionName).catch(() => {})
  if (!collectionExists) {
    return []
  }

  const filterConditions = getChunkSelector({ libraryId, documentId, extractionMethod, fragment })

  try {
    const { points } = await qdrantClient.scroll(collectionName, {
      filter: filterConditions,
      limit: take,
      with_payload: true,
      with_vector: true,
      order_by: { key: 'chunk', direction: 'asc', start_from: firstChunk ? firstChunk : 0 },
    })
    logger.debug('Fetched chunks from Qdrant', {
      collectionName,
      filterConditions,
      take,
      firstChunk,
      points: points.map((point) => ({
        id: point.id,
        payload: JSON.stringify(point.payload, null, 2),
        vectors: point.vector ? Object.keys(point.vector) : [],
      })),
    })
    return points.map((point) => {
      const embeddingModelNames = point.vector ? Object.keys(point.vector) : []
      return {
        embeddingModelNames,
        ...VectorStoreChunkSchema.parse(point.payload),
      }
    })
  } catch (error) {
    console.error('Error fetching chunks from Qdrant:', error)
    throw error
  }
}
