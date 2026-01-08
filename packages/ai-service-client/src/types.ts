export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export type ServiceProviderType = 'ollama' | 'openai'

export type InstanceStatus = 'unknown' | 'online' | 'offline' | 'error'

export interface ServiceProviderConfig {
  provider: ServiceProviderType
  workspaceId: string
  endpoints: { name: string; apiKey?: string; url?: string; vramGB: number }[]
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
