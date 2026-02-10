import { EmbeddingCall, ModelProviderInstance } from '@george-ai/event-service-client'
import { getEmbeddings } from '@george-ai/llm-client'

import { logger } from '../common'

export async function generateEmbedding(event: EmbeddingCall, providerInstance: ModelProviderInstance) {
  logger.debug('Generating embedding for event', { event, providerInstance })
  const embeddingResult = await getEmbeddings({
    modelProvider: providerInstance.modelProvider,
    modelName: event.modelName,
    textChunks: event.inputTexts,
    connection: providerInstance.connection,
  })
  logger.debug('Generated embedding result', { embeddingResult })
}
