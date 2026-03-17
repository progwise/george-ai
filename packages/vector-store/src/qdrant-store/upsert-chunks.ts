import { VectorStoreChunk } from '../schema'
import { getChunkIdentifier, getCollectionName, logger, qdrantClient } from './common'

export async function upsertChunks(parameters: {
  workspaceId: string
  chunks: (VectorStoreChunk & { embedding?: { embeddingModelName: string; vector: number[] } })[]
}): Promise<void> {
  const { workspaceId, chunks } = parameters
  const collectionName = getCollectionName(workspaceId)
  const points = chunks.map((chunk) => ({
    id: getChunkIdentifier(chunk),
    vector: !chunk.embedding ? {} : { [`${chunk.embedding.embeddingModelName}`]: chunk.embedding.vector }, // Vectors are added separately
    payload: chunk,
    wait: false,
  }))
  logger.info('Upserting chunks', {
    workspaceId,
    collectionName,
    points: points.map((point) => ({
      id: point.id,
      payload: JSON.stringify(point.payload),
      hasVector: !!point.vector,
    })),
  })
  const result = await qdrantClient.upsert(collectionName, { wait: true, points })

  logger.info('Upserted chunks', { workspaceId, collectionName, result })
}
