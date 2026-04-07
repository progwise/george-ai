import { InferenceDriver } from '@george-ai/app-schema'

import { VectorStoreChunk } from '../schema'
import { getChunkIdentifier, getCollectionName, logger, qdrantClient } from './common'

export async function upsertChunks(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  chunks: (VectorStoreChunk & { vector: number[] })[]
}): Promise<void> {
  const { workspaceId, modelDriver, modelName, chunks } = parameters
  const collectionName = getCollectionName({ workspaceId, modelDriver, modelName })

  const points = chunks.map((chunk) => {
    const { vector, ...payload } = chunk
    return {
      id: getChunkIdentifier(chunk),
      vector, // Vectors are added separately
      payload,
      wait: false,
    }
  })

  logger.debug('Upserting chunks', {
    workspaceId,
    collectionName,
    points: points.map((point) => ({
      id: point.id,
      payload: JSON.stringify(point.payload),
      hasVector: !!point.vector,
    })),
  })

  const result = await qdrantClient.upsert(collectionName, { wait: true, points }).catch((error) => {
    const errorJSON =
      error instanceof Error && 'data' in error ? JSON.stringify(error.data, null, 2) : JSON.stringify(error, null, 2)
    if (errorJSON.includes('Vector dimension error')) {
      logger.error('Vector dimension error while upserting chunks to Qdrant', {
        workspaceId,
        collectionName,
        errorJSON,
      })
      throw new Error('Vector dimension error: The embedding vector has a different dimension than the collection.')
    }
    logger.error('Error upserting chunks to Qdrant', { workspaceId, collectionName, errorJSON, error })
    throw error
  })

  logger.info('Upserted chunks', { workspaceId, collectionName, result })
}
