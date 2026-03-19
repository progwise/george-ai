import { InferenceDriver } from '@george-ai/app-schema'

import { getCollectionName, qdrantClient } from './common'

export async function existsVectorStore(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
}): Promise<boolean> {
  const collectionName = getCollectionName(parameters)
  const { exists } = await qdrantClient.collectionExists(collectionName)
  return exists
}
