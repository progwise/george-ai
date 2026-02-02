import { ExtractionMethod } from '@george-ai/app-commons'

import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunkCount(parameters: {
  workspaceId: string
  libraryId?: string
  fileId?: string
  extractionMethod?: ExtractionMethod | null
  modelName?: string | null
  fragment?: number | null
}): Promise<number> {
  const { workspaceId, libraryId, fileId, extractionMethod, modelName, fragment } = parameters

  const collectionName = getCollectionName(workspaceId)
  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod, modelName, fragment })

  const count = await qdrantClient.count(collectionName, { filter: filterConditions })
  return count.count || 0
}
