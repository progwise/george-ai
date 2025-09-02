import { Ollama } from 'ollama'

import type { AIResponse, ChatOptions } from './types.js'

export async function ollamaChat(options: ChatOptions): Promise<AIResponse> {
  // Create dedicated client instance for this request
  const client = new Ollama({
    host: process.env.OLLAMA_BASE_URL,
    headers: process.env.OLLAMA_API_KEY ? { 'X-API-Key': `${process.env.OLLAMA_API_KEY}` } : undefined,
  })
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime

  try {
    const response = await client.chat({
      model: options.model,
      messages: options.messages,
      stream: true, // Always stream internally for loop detection
    })

    // Set timeout if specified
    const timeoutId = options.timeout
      ? setTimeout(() => {
          if (response?.abort) {
            response.abort()
          }
        }, options.timeout)
      : null

    for await (const chunk of response) {
      const content = chunk.message?.content || ''
      if (content) {
        allContent += content
        tokenCount++
        lastChunkTimestamp = Date.now()

        // Optional streaming callback
        if (options.onChunk) {
          options.onChunk(content)
        }
      }
    }

    // Clear timeout on successful completion
    if (timeoutId) clearTimeout(timeoutId)

    return {
      content: allContent,
      success: true,
      metadata: {
        tokensProcessed: tokenCount,
        timeElapsed: Date.now() - startTime,
        lastChunkTimestamp,
      },
    }
  } catch (error) {
    // Handle timeout, abort errors, etc.
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        content: allContent,
        success: false,
        issues: {
          timeout: true,
          partialResult: allContent.length > 0,
        },
        metadata: {
          tokensProcessed: tokenCount,
          timeElapsed: Date.now() - startTime,
          lastChunkTimestamp,
        },
      }
    }

    // Re-throw other errors
    throw error
  }
}

// Export as named export for clarity
export const chat = ollamaChat
