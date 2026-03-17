import { ExtractionMethod } from '@george-ai/app-schema'

import { DocumentChunk } from '../schema'
import { getChunks } from './get-chunks'

export async function* readChunks(params: {
  workspaceId: string
  libraryId: string
  documentId: string
  extractionMethod?: ExtractionMethod | null
}): AsyncIterable<DocumentChunk[]> {
  const { workspaceId, libraryId, documentId, extractionMethod } = params

  const batchSize = 10
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const chunks = await getChunks({
      workspaceId,
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
