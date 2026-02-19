import { ChatCompletionCall, ModelProviderInstance, modelCalls } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function generateChatCompletion(event: ChatCompletionCall, providerInstance: ModelProviderInstance) {
  logger.debug('Generating chat completion for event', { event, providerInstance })

  const chatCompletionCall: ChatCompletionCall = {
    version: 1,
    modelCallType: 'generateChatCompletion',
    modelName: event.modelName,
    workspaceId: event.workspaceId,
    provider: event.provider,
    messages: event.messages,
  }
  const chatResponseStream = await modelCalls.directModelCall(chatCompletionCall)
  logger.debug('Generated chat completion result', { chatResponseStream })
}
