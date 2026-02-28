import { VectorStoreChunk } from '../schema'
import { getChunkIdentifier, getCollectionName, qdrantClient } from './common'

export async function upsertChunks(parameters: { workspaceId: string; chunks: VectorStoreChunk[] }): Promise<void> {
  const { workspaceId, chunks } = parameters
  const collectionName = getCollectionName(workspaceId)
  const points = chunks.map((chunk) => ({
    id: getChunkIdentifier(chunk),
    vector: {}, // Vectors are added separately
    payload: chunk,
    wait: false,
  }))
  await qdrantClient.upsert(collectionName, { wait: false, points })
}
