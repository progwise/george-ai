export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
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
