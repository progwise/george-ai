import { EmbeddingCall, ModelProviderInstance, modelCalls } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function generateEmbedding(event: EmbeddingCall, providerInstance: ModelProviderInstance) {
  logger.debug('Generating embedding for event', { event, providerInstance })

  const embeddingCall: EmbeddingCall = {
    version: 1,
    modelCallType: 'generateEmbedding',
    modelName: event.modelName,
    workspaceId: event.workspaceId,
    provider: event.provider,
    inputTexts: event.inputTexts,
  }
  const embeddingResult = await modelCalls.directModelCall(embeddingCall)
  logger.debug('Generated embedding result', { embeddingResult })
}
