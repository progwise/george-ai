import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'

import { VectorStoreChunk, VectorStoreChunkSchema } from '../schema'
import { getCollectionName, logger, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function findSimilarChunks(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  libraryId?: string | null
  documentId?: string | null
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  vector: number[]
  topK: number
  maxDistance?: number
}): Promise<Array<VectorStoreChunk & { distance: number }>> {
  const { workspaceId, modelDriver, libraryId, documentId, extractionMethod, fragment, vector, topK, maxDistance } =
    parameters
  const collectionName = getCollectionName({ workspaceId, modelDriver, modelName: parameters.modelName })
  const filter = getChunkSelector({ libraryId, documentId, extractionMethod, fragment })

  try {
    const searchResult = await qdrantClient.search(collectionName, {
      vector,
      limit: topK,
      filter,
      with_payload: true,
      with_vector: false,
      ...(maxDistance !== undefined ? { score_threshold: maxDistance } : {}),
    })

    return searchResult.map((result) => ({
      ...VectorStoreChunkSchema.parse(result.payload),
      distance: 1 - result.score,
    }))
  } catch (error) {
    if (typeof error === 'object' && error != null && 'data' in error) {
      logger.error('Error finding similar chunks:', { collectionName, error, errorData: error.data })
    } else {
      logger.error('Error finding similar chunks:', { collectionName, error })
    }

    throw error
  }
}
