import { ExtractionMethod } from '@george-ai/app-schema'

import { getCollectionName, qdrantClient } from './common'
import { getChunkSelector } from './get-chunk-selector'
import { getEmbeddingModelNames } from './get-embedding-model-names'

export async function removeEmbeddings(parameters: {
  workspaceId: string
  libraryId: string
  fileId?: string
  fragment?: number | null
  extractionMethod?: ExtractionMethod | null
  embeddingModelNames?: string[]
}): Promise<void> {
  const { workspaceId, libraryId, fileId, fragment, extractionMethod, embeddingModelNames } = parameters
  const collectionName = getCollectionName(workspaceId)

  const filterConditions = getChunkSelector({ libraryId, fileId, extractionMethod, fragment })

  if (!embeddingModelNames) {
    const allEmbeddingModelNames = await getEmbeddingModelNames(workspaceId)
    await qdrantClient.deleteVectors(collectionName, {
      filter: filterConditions,
      vector: allEmbeddingModelNames,
      wait: false,
    })
    return
  }

  await qdrantClient.deleteVectors(collectionName, {
    filter: filterConditions,
    vector: embeddingModelNames,
    wait: false,
  })
}
