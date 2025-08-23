export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export interface ChatOptions {
  model: string
  messages: Message[]
  maxAllowedRepetitions?: number // undefined = no loop detection
  timeout?: number // in milliseconds
  onChunk?: (chunk: string) => void // optional streaming callback
}

export interface AIResponse {
  content: string // All content received (including repetitions)
  success: boolean // Whether processing completed normally
  issues?: {
    endlessLoop?: boolean // Loop detected
    timeout?: boolean // Processing timeout
    partialResult?: boolean // Content is incomplete
  }
  metadata?: {
    tokensProcessed?: number
    timeElapsed?: number
    lastChunkTimestamp?: number
    repetitiveChunk?: string // The actual repeating text for debugging
    repetitionCount?: number // How many times it repeated
  }
}
