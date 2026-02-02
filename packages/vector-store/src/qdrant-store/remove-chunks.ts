import { ExtractionMethod } from '@george-ai/app-commons'

import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function removeChunks(parameters: {
  workspaceId: string
  libraryId: string
  fileId?: string
  extractionMethod?: ExtractionMethod | null
}): Promise<void> {
  const { workspaceId, libraryId, fileId, extractionMethod } = parameters
  const collectionName = getCollectionName(workspaceId)

  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod })

  await qdrantClient.delete(collectionName, { filter: filterConditions, wait: true })
}
