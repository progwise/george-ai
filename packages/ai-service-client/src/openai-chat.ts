import { checkLineRepetition, getErrorObject } from '@george-ai/web-utils'

import { OpenAIChatCompletionChunkSchema } from './openai-api.js'
import type { AIResponse, Message } from './types.js'

export interface OpenAIChatOptions {
  model: string
  messages: Message[]
  apiKey: string
  baseUrl?: string
  timeout?: number // in milliseconds
  onChunk?: (chunk: string) => void // optional streaming callback
  abortSignal?: AbortSignal // optional abort signal to cancel the request
  abortOnConsecutiveRepeats?: number // number of repetitions to trigger abort
}

export async function openAIChat(options: OpenAIChatOptions): Promise<AIResponse> {
  let allContent = ''
  const startTime = Date.now()
  let tokenCount = 0
  let lastChunkTimestamp = startTime
  let promptTokens = 0
  let completionTokens = 0

  const baseUrl = options.baseUrl || 'https://api.openai.com/v1'
  console.log(`Using OpenAI API ${baseUrl} for model ${options.model}`)

  let isAborted = false
  let hasTimeout = false
  const startTimeout = Date.now()

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: true,
        stream_options: { include_usage: true }, // CRITICAL: Required for usage tracking
      }),
      signal: options.abortSignal,
    })

    if (!response.ok) {
      const responseText = await response.text()
      console.warn(`Failed to receive stream from OpenAI: ${response.status} - ${responseText}`)
      throw new Error(`Failed to receive stream from OpenAI: ${response.status} - ${responseText}`)
    }

    if (!response.body) {
      throw new Error('No response body stream from OpenAI')
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

            // Extract usage data (only in final chunk with stream_options)
            if (parsedChunk.usage) {
              promptTokens = parsedChunk.usage.prompt_tokens
              completionTokens = parsedChunk.usage.completion_tokens
            }
          } catch (error) {
            console.warn('Failed to parse OpenAI SSE chunk:', line, error)
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

    console.error('OpenAI chat request finally failed:', errorObject)

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
