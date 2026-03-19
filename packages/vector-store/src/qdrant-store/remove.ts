import { InferenceDriver } from '@george-ai/app-schema'

import { getCollectionName, qdrantClient } from './common'

export async function removeVectorStore(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
}): Promise<void> {
  const collectionName = getCollectionName(parameters)
  await qdrantClient.deleteCollection(collectionName, {})
}
