import { OllamaProviderConnection, OpenAiProviderConnection } from '@george-ai/app-commons'

import { ChatCompletionResult, ChatCompletionStreamChunk, ChatOptions } from './common'
import { getOllamaChatCompletion, getOllamaChatCompletionStream } from './ollama'
import { getOpenAIChatCompletion, getOpenAIChatCompletionStream } from './openAi'

export const chat = async (parameters: {
  connection: OllamaProviderConnection | OpenAiProviderConnection
  options: ChatOptions
}): Promise<ChatCompletionResult> => {
  const { connection, options } = parameters
  const { modelProvider } = connection

  switch (modelProvider) {
    case 'ollama':
      return await getOllamaChatCompletion(connection, options)
    case 'openai':
      return await getOpenAIChatCompletion(connection, options)
    default:
      throw new Error(`model type not implemented: ${modelProvider}`)
  }
}

export const chatStream = async (parameters: {
  connection: OllamaProviderConnection | OpenAiProviderConnection
  options: ChatOptions
}): Promise<ReadableStream<ChatCompletionStreamChunk>> => {
  const { connection, options } = parameters
  const { modelProvider } = connection

  switch (modelProvider) {
    case 'ollama':
      return await getOllamaChatCompletionStream(connection, options)
    case 'openai':
      return await getOpenAIChatCompletionStream(connection, options)
    default:
      throw new Error(`model type not implemented: ${modelProvider}`)
  }
}
