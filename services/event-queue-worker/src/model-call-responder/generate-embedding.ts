import { EmbeddingCall, EmbeddingResponse, ProviderInstance } from '@george-ai/event-service-client'
import { getEmbeddings } from '@george-ai/llm-client'

import { logger } from '../common'

export async function generateEmbedding(event: EmbeddingCall, providerInstance: ProviderInstance) {
  logger.debug('Generating embedding for event', { event, providerInstance })

  const startTime = Date.now()
  const result = await getEmbeddings({
    modelProvider: event.provider,
    modelName: event.modelName,
    connection: providerInstance.connection,
    textChunks: event.inputTexts,
  })

  const embeddingResponse: EmbeddingResponse = {
    version: 1,
    modelCallType: 'generateEmbedding',
    resultStatus: 'success',
    embeddings: result.embeddings.map((embedding) => embedding.embedding),
    providerInstanceUrl: providerInstance.connection.baseUrl || 'unknown',
    processingDurationMs: Date.now() - startTime,
  }
  return embeddingResponse
}
