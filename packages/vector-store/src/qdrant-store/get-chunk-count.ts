import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'

import { getCollectionName, logger, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunkCount(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  libraryId?: string | null
  documentId?: string | null
  extractionMethod?: ExtractionMethod | null

  fragment?: number | null
}): Promise<number | null> {
  const { workspaceId, modelDriver, modelName, libraryId, documentId, extractionMethod, fragment } = parameters

  logger.debug('Getting chunk count', {
    workspaceId,
    modelDriver,
    modelName,
    libraryId,
    documentId,
    extractionMethod,
    fragment,
  })

  const collectionName = getCollectionName({ workspaceId, modelDriver, modelName })
  const { exists } = await qdrantClient.collectionExists(collectionName)

  if (!exists) {
    return null
  }

  const filterConditions = getChunkSelector({ libraryId, documentId, extractionMethod, modelName, fragment })

  logger.debug('Count chunks with filter', { collectionName, filterConditions: JSON.stringify(filterConditions) })

  const count = await qdrantClient.count(collectionName, { filter: filterConditions })
  return count.count || 0
}
