import { checkLineRepetition, createLogger, getErrorObject } from '@george-ai/web-utils'

import type { AIResponse, ChatOptions } from '../types.js'
import { getChatResponseStream } from './ollama-api.js'
import { getOllamaResourceManager } from './ollama-resource-manager.js'

const logger = createLogger('Ollama Chat')

export async function ollamaChat(workspaceId: string, options: ChatOptions): Promise<AIResponse> {
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime

  // Select best OLLAMA instance based on current GPU memory usage and model availability
  const manager = getOllamaResourceManager(workspaceId)
  const { instance, semaphore } = await manager.getBestInstance(options.modelName)
  logger.info(`Using instance ${instance.config.url} for model ${options.modelName}`)

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
          // Log the full chunk to capture all error details
          logger.warn('Error chunk received:', {
            error: chunk.error,
            model: chunk.model,
            modelName: chunk.modelName,
            done: chunk.done,
            instance: instance.config.url,
            fullChunk: chunk,
          })
          throw new Error(
            `Error chunk received from OLLAMA: ${chunk.error}\nModel: ${chunk.modelName || chunk.model}\nInstance: ${instance.config.url}`,
          )
        }
        const content = chunk.message?.content || ''

        if (content) {
          allContent += content
          if (
            options.abortOnConsecutiveRepeats &&
            checkLineRepetition(allContent.split('\n'), options.abortOnConsecutiveRepeats)
          ) {
            logger.warn('Detected line repetition, stopping further processing', { contentLength: allContent.length })
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

    logger.error('Chat request failed:', errorObject)

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
