import { Readable } from 'stream'

import { ChatAttachment, ChatMessage, ChatResponseChunk, InferenceHostConnection } from '@george-ai/app-schema'

import { getOllamaChatCompletion, getOllamaChatCompletionStream } from './ollama'
import { getOpenAIChatCompletion, getOpenAIChatCompletionStream } from './openAi'

export const chat = async (parameters: {
  connection: InferenceHostConnection
  modelName: string
  messages: ChatMessage[]
  attachments: (ChatAttachment & { stream: Readable })[]
}): Promise<ChatResponseChunk> => {
  const { connection, modelName, messages, attachments } = parameters
  const { driver } = connection

  switch (driver) {
    case 'ollama':
      return await getOllamaChatCompletion(connection, modelName, messages, attachments)
    case 'openai':
      return await getOpenAIChatCompletion(connection, modelName, messages, attachments)
    default:
      throw new Error(`model type not implemented: ${driver}`)
  }
}

export const chatStream = async (parameters: {
  connection: InferenceHostConnection
  modelName: string
  messages: ChatMessage[]
  attachments: (ChatAttachment & { stream: Readable })[]
}): Promise<ReadableStream<ChatResponseChunk>> => {
  const { connection, modelName, messages, attachments } = parameters
  const { driver } = connection

  switch (driver) {
    case 'ollama':
      return await getOllamaChatCompletionStream(connection, modelName, messages, attachments)
    case 'openai':
      return await getOpenAIChatCompletionStream(connection, modelName, messages, attachments)
    default:
      throw new Error(`model type not implemented: ${driver}`)
  }
}
