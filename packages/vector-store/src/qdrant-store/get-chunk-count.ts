import { ExtractionMethod } from '@george-ai/app-commons'

import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunkCount(parameters: {
  workspaceId: string
  libraryId?: string | null
  fileId?: string | null
  extractionMethod?: ExtractionMethod | null
  modelName?: string | null
  fragment?: number | null
}): Promise<number | null> {
  const { workspaceId, libraryId, fileId, extractionMethod, modelName, fragment } = parameters

  const collectionName = getCollectionName(workspaceId)
  const collectionExists = await qdrantClient.collectionExists(collectionName)
  if (!collectionExists.exists) {
    return null
  }
  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod, modelName, fragment })

  const count = await qdrantClient.count(collectionName, { filter: filterConditions })
  return count.count || 0
}
