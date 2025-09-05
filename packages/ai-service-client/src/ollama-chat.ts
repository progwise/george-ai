import { Ollama } from 'ollama'

import { ollamaResourceManager } from './ollama-resource-manager.js'
import type { AIResponse, ChatOptions } from './types.js'

export async function ollamaChat(options: ChatOptions): Promise<AIResponse> {
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime

  // Select best OLLAMA instance based on current GPU memory usage and model availability
  const { instance } = await ollamaResourceManager.selectBestInstance(options.model)

  // Get semaphore for this instance to throttle concurrent requests
  const semaphore = await ollamaResourceManager.getSemaphore(instance.url)

  // Acquire semaphore before making request
  await semaphore.acquire()

  try {
    // Create dedicated client instance for this request
    const client = new Ollama({
      host: instance.url,
      headers: instance.apiKey ? { 'X-API-Key': instance.apiKey } : undefined,
    })

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
        instanceUrl: instance.url,
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
          instanceUrl: instance.url,
        },
      }
    }

    // Re-throw other errors
    throw error
  } finally {
    // Always release semaphore
    semaphore.release()

    // Optionally refresh semaphore limits based on current GPU memory
    // (Don't await to avoid blocking the response)
    ollamaResourceManager.refreshSemaphore(instance.url).catch((error) => {
      console.warn('Failed to refresh semaphore limits:', error)
    })
  }
}

// Export as named export for clarity
export const chat = ollamaChat
