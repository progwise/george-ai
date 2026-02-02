import { getCollectionName, qdrantClient } from './common'

export async function removeWorkspace(workspaceId: string): Promise<void> {
  const collectionName = getCollectionName(workspaceId)
  await qdrantClient.deleteCollection(collectionName, {})
}
