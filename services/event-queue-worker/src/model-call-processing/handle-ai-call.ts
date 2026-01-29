import {
  ChatCompletionCall,
  EmbeddingCall,
  type ModelCall,
  ModelProviderInstance,
} from '@george-ai/event-service-client'

import { generateChatCompletion } from './generate-chat-completion'
import { generateEmbedding } from './generate-embedding'

export async function handleAiCall(event: ModelCall, providerInstance: ModelProviderInstance) {
  switch (event.modelCallType) {
    case 'generateEmbedding':
      return await generateEmbedding(event as EmbeddingCall, providerInstance)
    case 'generateChatCompletion':
      return await generateChatCompletion(event as ChatCompletionCall, providerInstance)
    default:
      throw new Error(`Unknown AI call type: ${event}`)
  }
}
