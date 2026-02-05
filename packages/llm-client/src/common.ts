import { createLogger } from '@george-ai/app-commons'

export const SUPPORTED_PROVIDERS = ['ollama', 'openai'] as const
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number]

export const logger = createLogger('llm-client')

export interface ProviderConnection {
  providerBaseUrl?: string
  providerApiKey?: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export interface ChatOptions {
  modelName: string
  messages: Message[]
  timeout?: number // in milliseconds
  onChunk?: (chunk: string) => void // optional streaming callback
  abortSignal?: AbortSignal // optional abort signal to cancel the request
  abortOnConsecutiveRepeats?: number // number of repetitions to trigger abort
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

export interface ChatCompletionStreamChunk {
  chunk: string
  metadata?: {
    tokensProcessed?: number
    instanceUrl?: string // Which OLLAMA/OpenAI instance was used
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
