import { ChatCompletionCall, ModelProviderInstance } from '@george-ai/event-service-client'
import { chat } from '@george-ai/llm-client'

import { logger } from '../common'

export async function generateChatCompletion(event: ChatCompletionCall, providerInstance: ModelProviderInstance) {
  logger.debug('Generating chat completion for event', { event, providerInstance })
  const chatResponseStream = await chat({
    modelProvider: providerInstance.modelProvider,
    modelName: event.modelName,
    messages: event.messages,
    apiUrl: providerInstance.baseUrl,
    apiKey: providerInstance.apiKey,
  })
  logger.debug('Generated chat completion result', { chatResponseStream })
}
