import { ExtractionMethod } from '@george-ai/app-schema'

import { getCollectionName, logger, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunkCount(parameters: {
  workspaceId: string
  libraryId?: string | null
  documentId?: string | null
  extractionMethod?: ExtractionMethod | null
  modelName?: string | null
  fragment?: number | null
}): Promise<number | null> {
  const { workspaceId, libraryId, documentId, extractionMethod, modelName, fragment } = parameters

  logger.debug('Getting chunk count', { workspaceId, libraryId, documentId, extractionMethod, modelName, fragment })

  const collectionName = getCollectionName(workspaceId)
  const collectionExists = await qdrantClient.collectionExists(collectionName)
  if (!collectionExists.exists) {
    return null
  }
  const filterConditions = getChunkSelector({ libraryId, documentId, extractionMethod, modelName, fragment })

  logger.debug('Count chunks with filter', { collectionName, filterConditions: JSON.stringify(filterConditions) })

  const count = await qdrantClient.count(collectionName, { filter: filterConditions })
  return count.count || 0
}
