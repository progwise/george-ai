import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'

import { VectorStoreChunk } from '../schema'
import { getChunks } from './get-chunks'

export async function* readChunks(params: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  libraryId: string
  documentId: string
  extractionMethod?: ExtractionMethod | null
}): AsyncIterable<VectorStoreChunk[]> {
  const { workspaceId, modelDriver, modelName, libraryId, documentId, extractionMethod } = params

  const batchSize = 10
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const chunks = await getChunks({
      workspaceId,
      modelDriver,
      modelName,
      libraryId,
      documentId,
      extractionMethod,
      take: batchSize,
      firstChunk: offset, // TODO: Check if this works
    })

    if (chunks.length === 0) {
      hasMore = false
    } else {
      yield chunks
      offset += chunks.length
    }
  }
}
