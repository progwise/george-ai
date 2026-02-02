import { ExtractionMethod } from '@george-ai/app-commons'

import { VectorStoreChunk } from '../schema'
import { getChunks } from './get-chunks'

export async function* readChunks(params: {
  workspaceId: string
  libraryId: string
  fileId: string
  extractionMethod?: ExtractionMethod | null
}): AsyncIterable<(VectorStoreChunk & { embeddingModelNames: string[] })[]> {
  const { workspaceId, libraryId, fileId, extractionMethod } = params

  const batchSize = 10
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const chunks = await getChunks({
      workspaceId,
      libraryId,
      fileId,
      extractionMethod,
      take: batchSize,
      skip: offset,
    })

    if (chunks.length === 0) {
      hasMore = false
    } else {
      yield chunks
      offset += chunks.length
    }
  }
}
