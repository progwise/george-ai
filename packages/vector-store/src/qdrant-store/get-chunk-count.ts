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

  logger.info('Getting chunk count', {
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

  const filterConditions = getChunkSelector({ libraryId, documentId, extractionMethod, fragment })
  const count = await qdrantClient.count(collectionName, { filter: filterConditions })
  logger.info('Count chunks with filter', { collectionName, count, filterConditions: JSON.stringify(filterConditions) })

  return count.count || 0
}
