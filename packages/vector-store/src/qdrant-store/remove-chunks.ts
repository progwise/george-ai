import { ExtractionMethod } from '@george-ai/app-schema'

import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'

export async function removeChunks(parameters: {
  workspaceId: string
  libraryId: string
  documentId?: string
  extractionMethod?: ExtractionMethod | null
}): Promise<void> {
  const { workspaceId, libraryId, documentId, extractionMethod } = parameters
  const collectionName = getCollectionName(workspaceId)
  const exists = await qdrantClient.collectionExists(collectionName)
  if (!exists) {
    return
  }

  const filterConditions = getChunkSelector({ libraryId, documentId, extractionMethod })

  await qdrantClient.delete(collectionName, { filter: filterConditions, wait: true })
}
