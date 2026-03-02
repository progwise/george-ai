import { Readable } from 'node:stream'

import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('llm-client')

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export interface ChatAttachment {
  fileName: string
  mimeType: string
  size: number
  stream: Readable
}

export interface ChatOptions {
  modelName: string
  messages: ChatMessage[]
  attachments?: ChatAttachment[]
}

export interface AIResponse {
  content: string // All content received
  success: boolean // Whether processing completed normally
  issues?: {
    timeout?: boolean // Processing timeout
    partialResult: boolean // Content is incomplete
  }
  metadata?: {
    tokensProcessed?: number
    timeElapsed?: number
    lastChunkTimestamp?: number
    instanceUrl?: string // Which OLLAMA/OpenAI instance was used
    promptTokens?: number // For usage tracking (OpenAI)
    completionTokens?: number // For usage tracking (OpenAI)
  }
  error?: object
}

export interface ChatCompletionResult {
  model: string
  content: string
  created: Date
  promptTokens?: number
  completionTokens?: number
}

export interface ChatCompletionStreamChunk {
  chunk: string
  metadata?: {
    tokensProcessed?: number
    instanceUrl?: string | null // Which OLLAMA/OpenAI instance was used
    promptTokens?: number // For usage tracking (OpenAI)
    completionTokens?: number // For usage tracking (OpenAI)
  }
}

export interface EmbeddingsResult {
  usage: { promptTokens: number; totalTokens: number }
  embeddings: { inputText: string; embedding: number[] }[]
}

export interface TestResult {
  success: boolean
  errorMessage?: string
}
