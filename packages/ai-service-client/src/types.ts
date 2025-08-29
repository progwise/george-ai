export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export interface ChatOptions {
  model: string
  messages: Message[]
  timeout?: number // in milliseconds
  onChunk?: (chunk: string) => void // optional streaming callback
}

export interface AIResponse {
  content: string // All content received
  success: boolean // Whether processing completed normally
  issues?: {
    timeout: boolean // Processing timeout
    partialResult: boolean // Content is incomplete
  }
  metadata?: {
    tokensProcessed?: number
    timeElapsed?: number
    lastChunkTimestamp?: number
  }
}
