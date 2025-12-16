import { checkLineRepetition, createLogger, getErrorObject } from '@george-ai/web-utils'

import type { AIResponse, ChatOptions } from '../types.js'
import { OpenAIChatCompletionChunkSchema } from './openai-api.js'

const logger = createLogger('OpenAI Chat')

export async function openAIChat(options: ChatOptions, apiKey: string): Promise<AIResponse> {
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime
  let promptTokens = 0
  let completionTokens = 0

  const baseUrl = 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error('OPEN_AI_KEY environment variable is not set')
  }

  let isAborted = false
  let hasTimeout = false
  const startTimeout = Date.now()

  try {
    let response: Response
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.modelName,
          messages: options.messages,
          stream: true,
          stream_options: { include_usage: true }, // CRITICAL: Required for usage tracking
        }),
        signal: options.abortSignal,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.warn('Network error connecting to OpenAI:', {
        error: errorMessage,
        model: options.modelName,
        url: baseUrl,
      })
      throw new Error(`Network error connecting to OpenAI at ${baseUrl}: ${errorMessage}\nModel: ${options.modelName}`)
    }

    if (!response.ok) {
      let responseText = ''
      try {
        responseText = await response.text()
      } catch (error) {
        logger.warn('Failed to read error response body:', error)
      }
      logger.warn('Failed to receive stream from OpenAI:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        model: options.modelName,
        url: baseUrl,
      })
      throw new Error(
        `Failed to receive stream from OpenAI: ${response.status} ${response.statusText}\n` +
          `Model: ${options.modelName}\nURL: ${baseUrl}\n` +
          `Response: ${responseText}`,
      )
    }

    if (!response.body) {
      throw new Error(`No response body stream from OpenAI (URL: ${baseUrl}, Model: ${options.modelName})`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        if (options.abortSignal?.aborted) {
          isAborted = true
          break
        }

        if (options.timeout && Date.now() - startTimeout > options.timeout) {
          hasTimeout = true
          break
        }

        // Parse SSE format: "data: {...}\n\n"
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          if (line === 'data: [DONE]') continue

          try {
            const json = JSON.parse(line.slice(6))
            const parsedChunk = OpenAIChatCompletionChunkSchema.parse(json)

            // Extract content
            const content = parsedChunk.choices?.[0]?.delta?.content || ''

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

            // Extract usage data (only in final chunk with stream_options)
            if (parsedChunk.usage) {
              promptTokens = parsedChunk.usage.prompt_tokens
              completionTokens = parsedChunk.usage.completion_tokens
            }
          } catch (error) {
            logger.warn('Failed to parse OpenAI SSE chunk:', { line, error })
            // Skip invalid chunks but continue processing
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return {
      content: allContent,
      success: true,
      issues: {
        timeout: hasTimeout,
        partialResult: (isAborted || hasTimeout) && allContent.length > 0,
      },
      metadata: {
        instanceUrl: baseUrl,
        tokensProcessed: tokenCount,
        timeElapsed: Date.now() - startTime,
        lastChunkTimestamp,
        promptTokens,
        completionTokens,
      },
    }
  } catch (error) {
    const errorObject = getErrorObject(error)

    logger.error('OpenAI chat request failed:', errorObject)

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
        instanceUrl: baseUrl,
        promptTokens,
        completionTokens,
      },
    }
  }
}
