import { InferenceDriver } from '@george-ai/app-schema'

import { getCollectionName, qdrantClient } from './common'

export async function getVectorStore(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
}): Promise<{
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  name: string
  exists: boolean
  version?: number
  status?: string
  vectorDimensions?: number
  chunkCount?: number
  warnings?: string[]
}> {
  const collectionName = getCollectionName(parameters)
  const { exists } = await qdrantClient.collectionExists(collectionName)

  const { workspaceId, modelDriver, modelName } = parameters

  if (!exists) {
    return {
      workspaceId,
      modelDriver,
      modelName,
      name: collectionName,
      exists: false,
    }
  }

  const collectionInfo = await qdrantClient.getCollection(collectionName)
  const vectors = collectionInfo.config.params.vectors
  if (vectors && typeof vectors === 'object') {
    if ('size' in vectors && 'distance' in vectors) {
      // Single model config
      return {
        workspaceId,
        modelDriver,
        modelName,
        name: collectionName,
        exists: true,
        version: 1,
        status: collectionInfo.status,
        vectorDimensions: Number(vectors.size),
        chunkCount: collectionInfo.points_count || undefined,
        warnings: collectionInfo.warnings?.map((warning) => warning.message) || undefined,
      }
    }
  }

  // Multiple model config - need to check if the specific model exists
  if (vectors && typeof vectors === 'object' && modelName in vectors) {
    return {
      workspaceId,
      modelDriver,
      modelName,
      name: collectionName,
      exists: true,
      version: 1,
      status: collectionInfo.status,
      chunkCount: collectionInfo.points_count || undefined,
      warnings: collectionInfo.warnings?.map((warning) => warning.message) || undefined,
    }
  }

  return {
    workspaceId,
    modelDriver,
    modelName,
    name: collectionName,
    exists: false,
    warnings: [`Collection exists but model ${modelName} not found in vectors config`],
  }
}
