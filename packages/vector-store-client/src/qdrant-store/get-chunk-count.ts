import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function getChunkCount(parameters: {
  workspaceId: string
  libraryId?: string
  fileId?: string
  extractionMethod?: string | null
}): Promise<number> {
  const { workspaceId, libraryId, fileId, extractionMethod } = parameters

  const collectionName = getCollectionName(workspaceId)
  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod })

  const count = await qdrantClient.count(collectionName, { filter: filterConditions })
  return count.count || 0
}
