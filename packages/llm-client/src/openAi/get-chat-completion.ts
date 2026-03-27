import pRetry from 'p-retry'
import { Readable } from 'stream'
import z from 'zod'

import { decryptValue } from '@george-ai/app-commons'
import { ChatAttachment, ChatMessage, ChatResponseChunk, OpenAIHostConnection } from '@george-ai/app-schema'

import { Base64Encoder } from '../base64-encoder'
import { DEFAULT_BASE_URL, logger } from './common'
import { OpenAIChatCompletionChunkSchema, OpenAIChatCompletionSchema, OpenAIChatStreamChunkSchema } from './schema'

export const openAIChatJsonGenerator = async function* (options: {
  model: string
  stream: boolean
  messages: ChatMessage[]
  attachments?: (ChatAttachment & { stream: Readable })[]
}) {
  const { model, stream, messages, attachments } = options
  const encoder = new TextEncoder()
  yield encoder.encode(
    JSON.stringify({
      model,
      stream,
      ...(stream ? { stream_options: { include_usage: true } } : {}),
    }).slice(0, -1) + ',"messages": [',
  )

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (i > 0) {
      yield encoder.encode(', ')
    }
    yield encoder.encode(`{ "role": "${message.role}", "content": "${message.content}" }`)
  }

  if (attachments) {
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i]
      if (i > 0 || messages.length > 0) {
        yield encoder.encode(',')
      }
      yield encoder.encode(
        `{ "role": "user", "content": [ { "type": "text", "text": "This is the image ${attachment.fileName}" }, { "type": "image_url", "image_url": { "url": "data:${attachment.mimeType};base64,`,
      )

      // Stream the base64 chunks directly
      for await (const chunk of attachments[i].stream.pipe(new Base64Encoder({}))) {
        yield chunk
      }
      yield encoder.encode('" } } ] }')
    }
  }

  yield encoder.encode(']}')
}

export async function getOpenAIChatCompletion(
  connection: OpenAIHostConnection,
  modelName: string,
  messages: ChatMessage[],
  attachments?: (ChatAttachment & { stream: Readable })[],
  abortSignal?: AbortSignal,
): Promise<ChatResponseChunk> {
  const { baseUrl, encryptedApiKey } = connection

  const requestInit: RequestInit & { duplex: 'half' } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${decryptValue(encryptedApiKey)}`,
    },
    // Casting just the body is the "surgical" way to fix the type mismatch
    body: Readable.from(
      openAIChatJsonGenerator({ model: modelName, stream: false, messages, attachments }),
    ) as unknown as ReadableStream,
    duplex: 'half',
    signal: abortSignal,
  }

  const response = await pRetry(() => fetch(`${baseUrl || DEFAULT_BASE_URL}/chat/completions`, requestInit), {
    retries: 3,
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn(`Failed to POST openai api for chat completion`, {
      connection,
      DEFAULT_BASE_URL,
      status: response.status,
      responseText,
    })
    throw new Error(`Failed to POST OpenAI API ${baseUrl || DEFAULT_BASE_URL}/chat/completions: ${response.status}`)
  }

  const data = await response.json()
  const result = OpenAIChatCompletionSchema.parse(data)
  return {
    completionLine: result.choices
      .map((choice) => choice.message.content)
      .filter((message) => !!message)
      .join('\n'),
    created: new Date(result.created),
    completionTokens: result.usage.completion_tokens,
    promptTokens: result.usage.prompt_tokens,
  }
}

export async function getOpenAIChatCompletionStream(
  connection: OpenAIHostConnection,
  modelName: string,
  messages: ChatMessage[],
  attachments?: (ChatAttachment & { stream: Readable })[],
  abortSignal?: AbortSignal,
): Promise<ReadableStream<ChatResponseChunk>> {
  const { baseUrl, encryptedApiKey } = connection

  const requestInit: RequestInit & { duplex: 'half' } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${decryptValue(encryptedApiKey)}`,
    },
    // Casting just the body is the "surgical" way to fix the type mismatch
    body: Readable.from(
      openAIChatJsonGenerator({ model: modelName, stream: true, messages, attachments }),
    ) as unknown as ReadableStream,
    duplex: 'half',
    signal: abortSignal,
  }

  const response = await pRetry(() => fetch(`${baseUrl || DEFAULT_BASE_URL}/chat/completions`, requestInit), {
    retries: 3,
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn('Failed to POST streaming openai api /chat/completions', {
      connection,
      DEFAULT_BASE_URL,
      status: response.status,
      responseText,
    })
    throw new Error(
      `Failed to POST openai api: ${connection.baseUrl || DEFAULT_BASE_URL}/chat/completions: ${response.status}`,
    )
  }

  if (!response.body) {
    logger.error('Failed to retrieve streaming body for openai chat streaming api', {
      connection,
      modelName,
      messages,
      attachments,
      status: response.status,
    })
    throw new Error(
      `Failed to retrieve streaming body for ollama chat streaming api on ${connection.baseUrl || DEFAULT_BASE_URL}/api/chat`,
    )
  }

  const transformStream = new TransformStream<string, ChatResponseChunk>({
    start(controller) {
      // Listen for abort signal and close the stream
      abortSignal?.addEventListener('abort', () => {
        controller.terminate()
      })
    },
    transform(chunk, controller) {
      // Check if aborted before processing
      if (abortSignal?.aborted) {
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
            const streamChunk = OpenAIChatStreamChunkSchema.parse({
              modelName: modelName,
              id: parsedChunk.id,
              created: parsedChunk.created,
              delta: choice.delta,
              finish_reason: choice.finish_reason,
              usage: parsedChunk.usage,
              done: choice.finish_reason !== null, // Stream is done when finish_reason is set
            })

            const commonChunk: ChatResponseChunk = {
              completionLine: streamChunk.delta.content || undefined,
              thinkingLine: streamChunk.delta.reasoning_content || undefined,
              promptTokens: streamChunk.usage?.prompt_tokens,
              completionTokens: streamChunk.usage?.completion_tokens,
              created: new Date(),
            }

            controller.enqueue(commonChunk)
          } else if (parsedChunk.usage !== null && parsedChunk.usage !== undefined) {
            // Final chunk with usage stats (when stream_options.include_usage is true)
            // Choices array may be empty, but usage stats are present
            const streamChunk = OpenAIChatStreamChunkSchema.parse({
              modelName: modelName,
              id: parsedChunk.id,
              created: parsedChunk.created,
              delta: {},
              finish_reason: null,
              usage: parsedChunk.usage,
              done: true,
            })

            const commonChunk: ChatResponseChunk = {
              promptTokens: streamChunk.usage?.prompt_tokens,
              completionTokens: streamChunk.usage?.completion_tokens,
              created: new Date(),
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
