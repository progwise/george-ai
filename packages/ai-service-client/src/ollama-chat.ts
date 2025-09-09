import { getErrorObject } from '@george-ai/web-utils'

import { getOllamaClient } from './ollama-client.js'
import { ollamaResourceManager } from './ollama-resource-manager.js'
import type { AIResponse, Message } from './types.js'

interface ChatOptions {
  model: string
  messages: Message[]
  timeout?: number // in milliseconds
  onChunk?: (chunk: string) => void // optional streaming callback
  abortSignal?: AbortSignal // optional abort signal to cancel the request
}

export async function ollamaChat(options: ChatOptions): Promise<AIResponse> {
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime

  // Select best OLLAMA instance based on current GPU memory usage and model availability
  const { instance, semaphore } = await ollamaResourceManager.getBestInstance(options.model)
  console.log(`Using OLLAMA instance ${instance.config.url} for model ${options.model}`)

  let isAborted = false
  let hasTimeout = false
  const startTimeout = Date.now()

  try {
    // Acquire semaphore before making request
    await semaphore.acquire()

    // Create dedicated client instance for this request
    const client = getOllamaClient(instance.config)

    const response = await client.chat({
      model: options.model,
      messages: options.messages,
      stream: true, // Always stream internally for loop detection
    })

    for await (const chunk of response) {
      if (options.abortSignal?.aborted) {
        isAborted = true
        response.abort()
        break
      }

      if (options.timeout && Date.now() - startTimeout > options.timeout) {
        hasTimeout = true
        response.abort()
        break
      }

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

    semaphore.release()

    return {
      content: allContent,
      success: true,
      issues: {
        timeout: hasTimeout,
        partialResult: (isAborted || hasTimeout) && allContent.length > 0,
      },
      metadata: {
        instanceUrl: instance.config.url,
        tokensProcessed: tokenCount,
        timeElapsed: Date.now() - startTime,
        lastChunkTimestamp,
      },
    }
  } catch (error) {
    // Release semaphore before retry to prevent deadlock
    semaphore.release()

    const errorObject = getErrorObject(error)

    console.error('OLLAMA chat request finally failed:', errorObject)

    return {
      content: allContent,
      success: false,
      error: errorObject,
      issues: {
        timeout: hasTimeout,
        partialResult: allContent.length > 0,
      },
      metadata: {
        tokensProcessed: tokenCount,
        timeElapsed: Date.now() - startTime,
        lastChunkTimestamp,
        instanceUrl: instance.config.url,
      },
    }
  }
}
