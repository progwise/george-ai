import { getCollectionName, qdrantClient } from './common'

export async function getWorkspaceCollection(workspaceId: string): Promise<{
  id: string
  name: string
  exists: boolean
  version?: number
  status?: string
  chunkCount?: number
  warnings?: string[]
  modelConfigs?: {
    modelName: string
    dimensions: number
    distance: string
  }[]
}> {
  const collectionName = getCollectionName(workspaceId)
  const { exists } = await qdrantClient.collectionExists(collectionName)

  if (!exists) {
    return {
      id: workspaceId,
      name: collectionName,
      exists: false,
    }
  }

  const collectionInfo = await qdrantClient.getCollection(collectionName)
  let modelConfigs: { modelName: string; dimensions: number; distance: string }[] = []
  const vectors = collectionInfo.config.params.vectors
  if (vectors && typeof vectors === 'object') {
    if ('size' in vectors && 'distance' in vectors) {
      // Single model config
      return {
        id: workspaceId,
        name: collectionName,
        exists: true,
        version: 1,
        status: collectionInfo.status,
        chunkCount: collectionInfo.points_count || undefined,
        warnings: collectionInfo.warnings?.map((warning) => warning.message) || undefined,
        modelConfigs: [],
      }
    } else {
      // Multiple model configs
      modelConfigs = Object.entries(vectors)
        .map(([modelName, modelConfig]) => {
          if (
            typeof modelConfig === 'object' &&
            modelConfig !== null &&
            'size' in modelConfig &&
            'distance' in modelConfig
          ) {
            return {
              modelName,
              dimensions: modelConfig.size,
              distance: modelConfig.distance,
            }
          }
          return null
        })
        .filter((config) => config !== null)
    }
  }
  return {
    id: workspaceId,
    name: collectionName,
    exists: true,
    version: 1,
    status: collectionInfo.status,
    chunkCount: collectionInfo.points_count || undefined,
    warnings: collectionInfo.warnings?.map((warning) => warning.message) || undefined,
    modelConfigs,
  }
}
