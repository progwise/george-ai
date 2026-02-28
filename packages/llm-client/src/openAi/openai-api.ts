import pRetry from 'p-retry'
import { z } from 'zod'

import { createLogger, decryptValue } from '@george-ai/app-commons'

import { ChatCompletionStreamChunk, Message } from '../common'

const logger = createLogger('OpenAI API')

const OpenAIModelSchema = z.object({
  id: z.string(),
  object: z.literal('model'),
  created: z.number(),
  owned_by: z.string(),
})

export type OpenAIModel = z.infer<typeof OpenAIModelSchema>

const OpenAIModelsResponseSchema = z.object({
  object: z.literal('list'),
  data: z.array(OpenAIModelSchema),
})

const OpenAIEmbeddingResponseSchema = z.object({
  object: z.literal('list'),
  data: z.array(
    z.object({
      object: z.literal('embedding'),
      embedding: z.array(z.number()),
      index: z.number(),
    }),
  ),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

const OpenAIChatCompletionChunkSchema = z
  .object({
    id: z.string(),
    object: z.literal('chat.completion.chunk'),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        index: z.number(),
        delta: z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']).optional(),
          content: z.string().nullable().optional(), // Can be null for tool calls
          reasoning_content: z.string().optional(), // For models with reasoning capabilities (e.g., o1)
          refusal: z.string().nullable().optional(), // Content moderation refusal message
          tool_calls: z
            .array(
              z.object({
                index: z.number(),
                id: z.string().optional(),
                type: z.literal('function').optional(),
                function: z
                  .object({
                    name: z.string().optional(),
                    arguments: z.string().optional(), // JSON string, streamed incrementally
                  })
                  .optional(),
              }),
            )
            .optional(), // For function calling (current API)
          function_call: z
            .object({
              name: z.string().optional(),
              arguments: z.string().optional(), // JSON string, streamed incrementally
            })
            .optional(), // Legacy function calling (deprecated but still supported)
          audio: z
            .object({
              id: z.string(),
              data: z.string(), // Base64 encoded audio data
              transcript: z.string().optional(),
            })
            .nullable()
            .optional(), // For audio generation models
        }),
        finish_reason: z.enum(['stop', 'length', 'content_filter', 'tool_calls', 'function_call']).nullable(),
        logprobs: z.unknown().nullable().optional(),
      }),
    ),
    usage: z
      .object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number(),
      })
      .nullable()
      .optional(), // Can be null, undefined, or an object
    system_fingerprint: z.string().nullable().optional(), // Can be null or undefined
  })
  .passthrough() // Allow additional fields like service_tier, obfuscation, etc.

export type OpenAIChatCompletionChunk = z.infer<typeof OpenAIChatCompletionChunkSchema>

const OpenAIStreamChunkSchema = z.object({
  modelName: z.string(), // Track which model this chunk is from
  id: z.string(),
  created: z.number(),
  delta: z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']).optional(),
    content: z.string().nullable().optional(),
    reasoning_content: z.string().optional(),
    refusal: z.string().nullable().optional(),
    tool_calls: z
      .array(
        z.object({
          index: z.number(),
          id: z.string().optional(),
          type: z.literal('function').optional(),
          function: z
            .object({
              name: z.string().optional(),
              arguments: z.string().optional(),
            })
            .optional(),
        }),
      )
      .optional(),
    function_call: z
      .object({
        name: z.string().optional(),
        arguments: z.string().optional(),
      })
      .optional(),
    audio: z
      .object({
        id: z.string(),
        data: z.string(),
        transcript: z.string().optional(),
      })
      .nullable()
      .optional(),
  }),
  finish_reason: z.enum(['stop', 'length', 'content_filter', 'tool_calls', 'function_call']).nullable(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullable()
    .optional(), // Can be null, undefined, or an object
  done: z.boolean().optional(), // Indicates stream completion
})

export type OpenAIStreamChunk = z.infer<typeof OpenAIStreamChunkSchema>

interface FetchParams {
  baseUrl?: string | null
  encryptedApiKey: string
  abortSignal?: AbortSignal
}

async function openAIApiGet<T>(
  instance: FetchParams,
  endpoint: string,
  schema: z.ZodSchema<T>,
): Promise<z.infer<typeof schema>> {
  let response: Response
  try {
    response = await pRetry(
      () =>
        fetch(`${instance.baseUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${decryptValue(instance.encryptedApiKey)}`,
            'Content-Type': 'application/json',
          },
          signal: instance.abortSignal,
        }),
      { retries: 3 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn('Network error connecting to OpenAI:', {
      error: errorMessage,
      endpoint,
      url: instance.baseUrl,
    })
    throw new Error(`Network error connecting to OpenAI at ${instance.baseUrl}: ${errorMessage}\nEndpoint: ${endpoint}`)
  }

  if (!response.ok) {
    let responseText = ''
    try {
      responseText = await response.text()
    } catch (error) {
      logger.warn('Failed to read error response body:', error)
    }
    logger.warn('Failed to fetch OpenAI API:', {
      status: response.status,
      statusText: response.statusText,
      responseText,
      endpoint,
      url: instance.baseUrl,
    })
    throw new Error(
      `Failed to fetch OpenAI API: ${response.status} ${response.statusText}\n` +
        `Endpoint: ${endpoint}\nURL: ${instance.baseUrl}\n` +
        `Response: ${responseText}`,
    )
  }

  const data = await response.json()
  return schema.parse(data)
}

async function openAIApiPost<T>(
  instance: FetchParams,
  endpoint: string,
  params: unknown,
  schema: z.ZodSchema<T>,
): Promise<z.infer<typeof schema>> {
  let response: Response
  try {
    response = await pRetry(
      () =>
        fetch(`${instance.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${decryptValue(instance.encryptedApiKey)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          signal: instance.abortSignal,
        }),
      { retries: 3 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn('Network error connecting to OpenAI:', {
      error: errorMessage,
      endpoint,
      url: instance.baseUrl,
    })
    throw new Error(`Network error connecting to OpenAI at ${instance.baseUrl}: ${errorMessage}\nEndpoint: ${endpoint}`)
  }

  if (!response.ok) {
    let responseText = ''
    try {
      responseText = await response.text()
    } catch (error) {
      logger.warn('Failed to read error response body:', error)
    }
    logger.warn('Failed to POST OpenAI API:', {
      status: response.status,
      statusText: response.statusText,
      responseText,
      endpoint,
      url: instance.baseUrl,
    })
    throw new Error(
      `Failed to POST OpenAI API: ${response.status} ${response.statusText}\n` +
        `Endpoint: ${endpoint}\nURL: ${instance.baseUrl}\n` +
        `Response: ${responseText}`,
    )
  }

  const data = await response.json()
  return schema.parse(data)
}

export async function getOpenAIModels(
  params: FetchParams,
): Promise<z.infer<typeof OpenAIModelsResponseSchema> & { timestamp: number }> {
  const data = await openAIApiGet(params, '/models', OpenAIModelsResponseSchema)
  return { ...data, timestamp: Date.now() }
}

export async function generateOpenAIEmbeddings(
  params: FetchParams,
  modelName: string,
  input: string | string[],
): Promise<{ embeddings: number[][]; usage: { promptTokens: number; totalTokens: number } }> {
  const data = await openAIApiPost(params, '/embeddings', { model: modelName, input }, OpenAIEmbeddingResponseSchema)

  return {
    embeddings: data.data.map((item) => item.embedding),
    usage: {
      promptTokens: data.usage.prompt_tokens,
      totalTokens: data.usage.total_tokens,
    },
  }
}

export async function getChatResponseStream(
  params: FetchParams,
  modelName: string,
  messages: Message[],
  options?: {
    abortSignal?: AbortSignal
    includeUsage?: boolean // Enable usage stats in final chunk
  },
): Promise<ReadableStream<ChatCompletionStreamChunk>> {
  let response: Response
  try {
    // Use pRetry for resilience against transient API errors
    response = await pRetry(
      () =>
        fetch(`${params.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${decryptValue(params.encryptedApiKey)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            messages: messages,
            stream: true,
            // Request usage stats in the final chunk if enabled
            ...(options?.includeUsage && { stream_options: { include_usage: true } }),
          }),
          signal: options?.abortSignal,
        }),
      { retries: 3 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn('Network error connecting to OpenAI for chat completion:', {
      error: errorMessage,
      url: params.baseUrl,
    })
    throw new Error(
      `Network error connecting to OpenAI at ${params.baseUrl}: ${errorMessage}\nEndpoint: /chat/completions`,
    )
  }

  if (!response.ok) {
    let responseText = ''
    try {
      responseText = await response.text()
    } catch (error) {
      logger.warn('Failed to read error response body:', error)
    }
    logger.warn('Failed to fetch OpenAI chat completion stream:', {
      status: response.status,
      statusText: response.statusText,
      responseText,
      url: params.baseUrl,
    })
    throw new Error(
      `Failed to fetch OpenAI chat completion stream: ${response.status} ${response.statusText}\n` +
        `URL: ${params.baseUrl}\n` +
        `Response: ${responseText}`,
    )
  }

  if (!response.body) {
    throw new Error('OpenAI response body is null')
  }

  const transformStream = new TransformStream<string, ChatCompletionStreamChunk>({
    start(controller) {
      // Listen for abort signal and close the stream
      options?.abortSignal?.addEventListener('abort', () => {
        controller.terminate()
      })
    },
    transform(chunk, controller) {
      // Check if aborted before processing
      if (options?.abortSignal?.aborted) {
        controller.terminate()
        return
      }

      // OpenAI uses Server-Sent Events (SSE) format:
      // data: {"id":"chatcmpl-123","object":"chat.completion.chunk",...}
      // data: {"id":"chatcmpl-123","object":"chat.completion.chunk",...}
      // data: [DONE]

      // Split by newlines to process each SSE line
      const lines = chunk.split('\n')

      for (const line of lines) {
        const trimmedLine = line.trim()

        // Skip empty lines
        if (!trimmedLine) {
          continue
        }

        // Check for SSE completion marker
        if (trimmedLine === 'data: [DONE]') {
          logger.debug('Received [DONE] marker, stream completed')
          continue
        }

        // Parse SSE format: must start with "data: "
        if (!trimmedLine.startsWith('data: ')) {
          logger.debug('Skipping non-data SSE line:', { line: trimmedLine })
          continue
        }

        // Extract JSON payload after "data: " prefix
        const jsonString = trimmedLine.slice(6) // Remove "data: " prefix

        try {
          const rawChunk = JSON.parse(jsonString)
          const parsedChunk = OpenAIChatCompletionChunkSchema.parse(rawChunk)

          // Transform to our standardized format
          if (parsedChunk.choices.length > 0) {
            const choice = parsedChunk.choices[0]
            const streamChunk = OpenAIStreamChunkSchema.parse({
              modelName: modelName,
              id: parsedChunk.id,
              created: parsedChunk.created,
              delta: choice.delta,
              finish_reason: choice.finish_reason,
              usage: parsedChunk.usage,
              done: choice.finish_reason !== null, // Stream is done when finish_reason is set
            })

            const commonChunk: ChatCompletionStreamChunk = {
              chunk: streamChunk.delta.content || streamChunk.delta.reasoning_content || '',
              metadata: {
                instanceUrl: params.baseUrl,
                promptTokens: streamChunk.usage?.prompt_tokens,
                completionTokens: streamChunk.usage?.completion_tokens,
                tokensProcessed: streamChunk.usage?.total_tokens,
              },
            }

            controller.enqueue(commonChunk)
          } else if (parsedChunk.usage !== null && parsedChunk.usage !== undefined) {
            // Final chunk with usage stats (when stream_options.include_usage is true)
            // Choices array may be empty, but usage stats are present
            const streamChunk = OpenAIStreamChunkSchema.parse({
              modelName: modelName,
              id: parsedChunk.id,
              created: parsedChunk.created,
              delta: {},
              finish_reason: null,
              usage: parsedChunk.usage,
              done: true,
            })

            const commonChunk: ChatCompletionStreamChunk = {
              chunk: '',
              metadata: {
                instanceUrl: params.baseUrl,
                promptTokens: streamChunk.usage?.prompt_tokens,
                completionTokens: streamChunk.usage?.completion_tokens,
                tokensProcessed: streamChunk.usage?.total_tokens,
              },
            }

            controller.enqueue(commonChunk)
          }
        } catch (error) {
          // Log parsing errors but continue processing other chunks
          if (error instanceof z.ZodError) {
            logger.warn('Failed to parse OpenAI chunk schema:', {
              line: jsonString,
              errors: error.errors,
            })
          } else {
            logger.warn('Failed to parse OpenAI chunk JSON:', {
              line: jsonString,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        }
      }
    },
  })

  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(transformStream)
}

export { OpenAIChatCompletionChunkSchema }
