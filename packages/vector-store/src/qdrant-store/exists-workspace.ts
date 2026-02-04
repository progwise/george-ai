import { getCollectionName, qdrantClient } from './common'

export async function existsWorkspace(workspaceId: string): Promise<boolean> {
  const collectionName = getCollectionName(workspaceId)
  const { exists } = await qdrantClient.collectionExists(collectionName)
  return exists
}
