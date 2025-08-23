import { Ollama } from 'ollama'
import { LoopDetector } from './loop-detector.js'
import type { ChatOptions, AIResponse } from './types.js'

export async function ollamaChat(options: ChatOptions): Promise<AIResponse> {
  // Create dedicated client instance for this request
  const client = new Ollama({ host: process.env.OLLAMA_BASE_URL })
  const detector = new LoopDetector(options.maxAllowedRepetitions)
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

        // Loop detection
        if (options.maxAllowedRepetitions !== undefined) {
          const { isLoop, repetitiveChunk } = detector.detectLoop(content)
          if (isLoop) {
            // Clear timeout and abort the stream
            if (timeoutId) clearTimeout(timeoutId)
            if (response?.abort) {
              response.abort()
            }

            return {
              content: allContent, // Return everything including repetitions
              success: false,
              issues: {
                endlessLoop: true,
                partialResult: true,
              },
              metadata: {
                repetitiveChunk,
                repetitionCount: detector.getCount(repetitiveChunk || ''),
                tokensProcessed: tokenCount,
                timeElapsed: Date.now() - startTime,
                lastChunkTimestamp,
              },
            }
          }
        }

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