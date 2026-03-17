import { EmbeddingRequest, EmbeddingResponse } from '@george-ai/event-service-client'
import { getEmbeddings } from '@george-ai/llm-client'

import { getInferenceModelConnection, logger } from './common'

export async function getEmbeddingResponse(event: EmbeddingRequest): Promise<EmbeddingResponse> {
  logger.debug('Generating embedding for event', event)

  const { driver, modelName, workspaceId } = event

  const connection = await getInferenceModelConnection({
    driver,
    modelName,
    workspaceId,
  })

  if (!connection) {
    throw new Error(`No connection found for ${event.driver} : ${event.modelName} in current workspace`)
  }

  const result = await getEmbeddings({
    modelName: event.modelName,
    connection: connection,
    textChunks: event.chunks,
  })

  const embeddingResponse: EmbeddingResponse = {
    version: 1,
    action: 'chunkEmbedding',
    embeddings: result.embeddings,
    workspaceId,
    verb: 'response',
    timestamp: new Date(),
    tokens: result.totalTokens,
  }
  return embeddingResponse
}
