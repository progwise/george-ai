import { ExtractionMethod } from '@george-ai/app-schema'

import { getChunkIdentifier, getCollectionName, qdrantClient } from './common'

export async function upsertEmbeddings(parameters: {
  workspaceId: string
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
  fragment?: number | null
  embeddingModelName: string
  embeddings: Array<{ chunk: number; vector: number[] }>
}): Promise<void> {
  const { workspaceId, libraryId, documentId, extractionMethod, fragment, embeddingModelName, embeddings } = parameters
  const collectionName = getCollectionName(workspaceId)

  if (embeddings.length === 0) {
    return
  }

  await qdrantClient.updateVectors(collectionName, {
    points: embeddings.map(({ chunk, vector }) => ({
      id: getChunkIdentifier({
        libraryId,
        documentId,
        extractionMethod,
        fragment,
        chunk,
      }),
      vector: { [embeddingModelName]: vector },
    })),
    wait: false,
  })
}
