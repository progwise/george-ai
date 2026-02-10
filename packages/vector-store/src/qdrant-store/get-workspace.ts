import { getCollectionName, qdrantClient } from './common'

export async function getWorkspace(workspaceId: string): Promise<{
  id: string
  name: string
  exists: boolean
  version?: number
  status?: string
  chunkCount?: number
  warnings?: string[]
  modelNames?: string[]
}> {
  const collectionName = getCollectionName(workspaceId)
  const { exists } = await qdrantClient.collectionExists(collectionName)

  if (!exists) {
    return {
      id: workspaceId,
      name: collectionName,
      exists: false,
      status: 'not_found',
    }
  }

  const collectionInfo = await qdrantClient.getCollection(collectionName)
  const modelNames = collectionInfo.config.params.vectors ? Object.keys(collectionInfo.config.params.vectors) : []
  return {
    id: workspaceId,
    name: collectionName,
    exists: true,
    version: 1,
    status: collectionInfo.status,
    chunkCount: collectionInfo.points_count || undefined,
    warnings: collectionInfo.warnings?.map((warning) => warning.message) || undefined,
    modelNames,
  }
}
