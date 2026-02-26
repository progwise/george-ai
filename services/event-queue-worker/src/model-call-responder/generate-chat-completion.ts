import { ChatCompletionCall, ChatCompletionResponse, ProviderInstance } from '@george-ai/event-service-client'
import { chat } from '@george-ai/llm-client'

import { logger } from '../common'

export async function generateChatCompletion(
  event: ChatCompletionCall,
  providerInstance: ProviderInstance,
): Promise<ChatCompletionResponse> {
  logger.debug('Generating chat completion for event', { event, providerInstance })

  const startTime = Date.now()
  const buffer: string[] = []

  const chatResponseStream = await chat({
    modelProvider: event.provider,
    modelName: event.modelName,
    messages: event.messages,
    connection: providerInstance.connection,
  })

  for await (const chunk of chatResponseStream) {
    buffer.push(chunk.chunk)
  }

  const response: ChatCompletionResponse = {
    version: 1,
    modelCallType: 'generateChatCompletion',
    chunks: buffer,
    processingDurationMs: Date.now() - startTime,
    providerInstanceUrl: providerInstance.connection.baseUrl || 'unknown',
    resultStatus: 'success',
    errorMessage: null,
  }
  return response
}
