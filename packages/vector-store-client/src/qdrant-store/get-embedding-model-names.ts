import { getCollectionName, qdrantClient } from './common'

export async function getEmbeddingModelNames(workspaceId: string): Promise<string[]> {
  const collectionName = getCollectionName(workspaceId)
  const info = await qdrantClient.getCollection(collectionName)
  const vectors = info.config.params.vectors
  if (typeof vectors === 'number' || typeof vectors?.size === 'number') {
    return []
  }

  return Object.keys(vectors || {})
}
