import { ChatCompletionStreamChunk, Message, SupportedProvider } from './common'
import { ollamaApi } from './ollama'
import { openAiApi } from './openAi'

export const chat = async (parameters: {
  modelProvider: SupportedProvider
  modelName: string
  messages: Message[]
  apiKey?: string
  apiUrl?: string
}): Promise<ReadableStream<ChatCompletionStreamChunk>> => {
  const { modelProvider, modelName, messages, apiUrl, apiKey } = parameters

  const abortController = new AbortController()

  if (modelProvider === 'ollama') {
    if (!apiUrl) {
      throw new Error('Ollama apiUrl is required in parameters')
    }
    const result = await ollamaApi.getChatResponseStream({ apiUrl, apiKey }, modelName, messages, {
      abortSignal: abortController.signal,
      includeUsage: true, // Enable token usage tracking
    })
    return result
  } else if (modelProvider === 'openai') {
    if (!apiKey) {
      throw new Error('OpenAI apiKey is required in parameters')
    }
    const result = await openAiApi.getChatResponseStream({ apiKey: apiKey }, modelName, messages, {
      abortSignal: abortController.signal,
      includeUsage: true, // Enable token usage tracking
    })
    return result
  } else {
    throw new Error(`Unsupported chat model provider: ${modelProvider}`)
  }
}
