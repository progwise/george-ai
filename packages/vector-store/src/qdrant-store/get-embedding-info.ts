import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-commons'

import { EmbeddingInfo } from '../interface'
import { getCollection, getCollectionName, qdrantClient } from './common'

export async function getEmbeddingInfo(parameters: {
  workspaceId: string
  libraryId?: string
  fileId?: string
}): Promise<EmbeddingInfo[]> {
  const { workspaceId, libraryId, fileId } = parameters
  const collectionName = getCollectionName(workspaceId)
  const collectionInfo = await getCollection(collectionName)
  if (!collectionInfo) {
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
          libraryId && { key: 'libraryId', match: { value: libraryId } },
          fileId && { key: 'fileId', match: { value: fileId } },
          { key: 'modelName', match: { value: modelName } },
          { key: 'extractionMethod', match: { value: extractionMethod } },
        ],
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
