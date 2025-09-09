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
    instanceUrl?: string // Which OLLAMA instance was used
  }
  error?: object
}
