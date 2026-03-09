import { EmbeddingStatus } from '@george-ai/app-schema'

import { getCollection, getCollectionName, logger } from './common'

export async function getEmbeddingStatus(parameters: {
  workspaceId: string
  embeddingModelName?: string
}): Promise<EmbeddingStatus> {
  const { workspaceId, embeddingModelName } = parameters
  const collectionName = getCollectionName(workspaceId)
  const collectionInfo = await getCollection(collectionName)
  if (!collectionInfo) {
    logger.warn('Qdrant collection not found for workspace when checking embedding status', { workspaceId })
    return 'WorkspaceNotFound'
  }
  if (
    !collectionInfo.config.params.vectors ||
    typeof collectionInfo.config.params.vectors === 'number' ||
    typeof collectionInfo.config.params.vectors.size === 'number'
  ) {
    logger.warn('Qdrant collection has unknown vector configuration when checking embedding status', { workspaceId })
    return 'UnknownModelConfig'
  }
  if (!embeddingModelName) {
    return 'Ready'
  }
  const vectorNames = Object.keys(collectionInfo.config.params.vectors)
  if (!vectorNames.includes(embeddingModelName)) {
    logger.warn('Embedding model not found in Qdrant collection when checking embedding status', {
      workspaceId,
      embeddingModelName,
    })
    return 'ModelNotFound'
  }
  return 'Ready'
}
