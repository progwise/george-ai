import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'

import { getChunkIdentifier, getCollectionName, qdrantClient } from './common'

export async function upsertEmbeddings(parameters: {
  workspaceId: string
  modelDriver: InferenceDriver
  modelName: string
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
  fragment?: number | null
  embeddings: Array<{ chunk: number; vector: number[] }>
}): Promise<void> {
  const { workspaceId, modelDriver, modelName, libraryId, documentId, extractionMethod, fragment, embeddings } =
    parameters
  const collectionName = getCollectionName({ workspaceId, modelDriver, modelName })

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
      vector,
    })),
    wait: false,
  })
}
