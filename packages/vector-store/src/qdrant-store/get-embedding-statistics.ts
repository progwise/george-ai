import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-commons'

import { getCollection, getCollectionName, logger, qdrantClient } from './common'

export interface EmbeddingStatistic {
  extractionMethod: ExtractionMethod
  modelName: string
  chunkCount: number
}

export async function getEmbeddingStatistics(parameters: {
  workspaceId: string
  libraryId?: string | null
  fileId?: string | null
}): Promise<EmbeddingStatistic[]> {
  const { workspaceId, libraryId, fileId } = parameters
  const collectionName = getCollectionName(workspaceId)
  const collectionExists = await qdrantClient.collectionExists(collectionName)
  if (!collectionExists.exists) {
    logger.warn('Collection does not exist', { collectionName })
    return []
  }
  const collectionInfo = await getCollection(collectionName)
  if (!collectionInfo) {
    logger.warn('Failed to get collection info', { collectionName })
    return []
  }
  if (
    !collectionInfo.config.params.vectors ||
    typeof collectionInfo.config.params.vectors === 'number' ||
    typeof collectionInfo.config.params.vectors.size === 'number'
  ) {
    return []
  }
  const results: {
    extractionMethod: ExtractionMethod
    modelName: string
    chunkCount: number
  }[] = []
  const vectorNames = Object.keys(collectionInfo.config.params.vectors)

  for (const extractionMethod of EXTRACTION_METHODS) {
    for (const modelName of vectorNames) {
      const filter = {
        must: [
          libraryId ? { key: 'libraryId', match: { value: libraryId } } : undefined,
          fileId ? { key: 'fileId', match: { value: fileId } } : undefined,
          { key: 'modelName', match: { value: modelName } },
          { key: 'extractionMethod', match: { value: extractionMethod } },
        ].filter((item) => !!item),
      }
      const countResult = await qdrantClient.count(collectionName, { filter })
      const chunkCount = countResult.count || 0
      if (chunkCount === 0) {
        continue
      }

      results.push({
        extractionMethod,
        modelName,
        chunkCount,
      })
    }
  }
  return results
}
