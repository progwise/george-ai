import { checkLineRepetition, getErrorObject } from '@george-ai/web-utils'

import type { AIResponse, ChatOptions } from '../types.js'
import { getChatResponseStream } from './ollama-api.js'
import { ollamaResourceManager } from './ollama-resource-manager.js'

export async function ollamaChat(
  options: ChatOptions,
  endpoints: { url: string; apiKey?: string; vramGB: number; name: string }[],
): Promise<AIResponse> {
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime

  // Select best OLLAMA instance based on current GPU memory usage and model availability
  const { instance, semaphore } = await ollamaResourceManager.getBestInstance(endpoints, options.modelName)
  console.log(`Using OLLAMA instance ${instance.config.url} for model ${options.modelName}`)

  let isAborted = false
  let hasTimeout = false
  const startTimeout = Date.now()

  try {
    // Acquire semaphore before making request
    await semaphore.acquire()

    const response = await getChatResponseStream(
      instance.config,
      options.modelName,
      options.messages,
      options.abortSignal,
    )
    const reader = response.getReader()

    try {
      while (true) {
        const { done, value: chunk } = await reader.read()

        if (done) break

        if (options.abortSignal?.aborted) {
          isAborted = true
          break
        }

        if (options.timeout && Date.now() - startTimeout > options.timeout) {
          hasTimeout = true
          break
        }

        if (chunk.error) {
          console.warn(`Error chunk received from OLLAMA ${instance.config.url}:`, chunk.error)
          throw new Error(`Error chunk received from OLLAMA: ${chunk.error}`)
        }
        const content = chunk.message?.content || ''

        if (content) {
          allContent += content
          if (
            options.abortOnConsecutiveRepeats &&
            checkLineRepetition(allContent.split('\n'), options.abortOnConsecutiveRepeats)
          ) {
            console.warn('Detected line repetition, stopping further processing.', allContent)
            throw new Error(
              `Aborted due to detected line repetition in response. Max allowed repetitions of ${options.abortOnConsecutiveRepeats} exceeded.`,
            )
          }
          tokenCount++
          lastChunkTimestamp = Date.now()

          // Optional streaming callback
          if (options.onChunk) {
            options.onChunk(content)
          }
        }
      }
    } finally {
      reader.releaseLock()
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
