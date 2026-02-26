import { ModelProvider, ProviderConnection } from '@george-ai/app-commons'

import { ChatCompletionStreamChunk, Message } from './common'
import { ollamaApi } from './ollama'
import { openAiApi } from './openAi'

export const chat = async (parameters: {
  modelProvider: ModelProvider
  modelName: string
  messages: Message[]
  connection: ProviderConnection
}): Promise<ReadableStream<ChatCompletionStreamChunk>> => {
  const { modelProvider, modelName, messages, connection } = parameters

  const abortController = new AbortController()
  const { baseUrl, apiKey } = connection
  if (modelProvider === 'ollama') {
    if (!baseUrl) {
      throw new Error('Ollama apiUrl is required in parameters')
    }
    const result = await ollamaApi.getChatResponseStream(
      { baseUrl, apiKey, abortSignal: abortController.signal },
      modelName,
      messages,
      {
        includeUsage: true, // Enable token usage tracking
      },
    )
    return result
  } else if (modelProvider === 'openai') {
    if (!apiKey) {
      throw new Error('OpenAI apiKey is required in parameters')
    }
    const result = await openAiApi.getChatResponseStream({ baseUrl, apiKey }, modelName, messages, {
      abortSignal: abortController.signal,
      includeUsage: true, // Enable token usage tracking
    })
    return result
  } else {
    throw new Error(`Unsupported chat model provider: ${modelProvider}`)
  }
}
