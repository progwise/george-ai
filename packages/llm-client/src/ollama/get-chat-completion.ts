import pRetry from 'p-retry'
import { Readable } from 'stream'

import { OllamaProviderConnection, decryptValue } from '@george-ai/app-commons'

import { Base64Encoder } from '../base64-encoder'
import { ChatAttachment, ChatCompletionResult, ChatCompletionStreamChunk, ChatMessage, ChatOptions } from '../common'
import { logger } from './common'
import { OllamaChatStreamChunkSchema } from './schema'

export const ollamaChatJsonBodyGenerator = async function* (options: {
  model: string
  messages: ChatMessage[]
  attachments?: ChatAttachment[]
}) {
  const { model, messages, attachments } = options
  const encoder = new TextEncoder()

  yield encoder.encode(
    JSON.stringify({
      model,
      stream: true, // false does not work: Ollama Bug.
      options: { num_ctx: 8192 },
    }).slice(0, -1) + ',"messages":[',
  )

  for (let i = 0; i < messages.length - 1; i++) {
    const message = messages[i]
    if (i > 0) yield encoder.encode(',')
    yield encoder.encode(` { "role":"${message.role}", "content": "${message.content}" }`)
  }

  const lastMessage = messages[messages.length - 1]

  if (messages.length > 1) yield encoder.encode(',')
  yield encoder.encode(` { "role":"${lastMessage.role}", "content": "${lastMessage.content}", "images": [`)

  if (attachments) {
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i]
      if (i > 0) yield encoder.encode(',')
      yield encoder.encode(`"`)

      // Stream the base64 chunks directly
      for await (const chunk of attachment.stream.pipe(new Base64Encoder({}))) {
        yield chunk
      }
      yield encoder.encode('"')
    }
  }

  yield encoder.encode(']}]}')
}

export async function getOllamaChatCompletion(
  connection: OllamaProviderConnection,
  options: ChatOptions,
  abortSignal?: AbortSignal,
): Promise<ChatCompletionResult> {
  const stream = await getOllamaChatCompletionStream(connection, options, abortSignal)

  const bufferedResult: Array<ChatCompletionStreamChunk> = []
  for await (const chunk of stream) {
    bufferedResult.push(chunk)
  }

  const result: ChatCompletionResult = {
    model: options.modelName,
    content: bufferedResult.map((c) => c.chunk).join(''),
    created: new Date(),
    completionTokens: bufferedResult.reduce((acc, c) => acc + (c.metadata?.completionTokens || 0), 0),
    promptTokens: bufferedResult.reduce((acc, c) => acc + (c.metadata?.promptTokens || 0), 0),
  }

  return result
}

export async function getOllamaChatCompletionStream(
  connection: OllamaProviderConnection,
  options: ChatOptions,
  abortSignal?: AbortSignal,
): Promise<ReadableStream<ChatCompletionStreamChunk>> {
  const { baseUrl, encryptedApiKey } = connection
  const { messages, modelName, attachments } = options

  const requestInit: RequestInit & { duplex: 'half' } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(encryptedApiKey ? { Authorization: `Bearer ${decryptValue(encryptedApiKey)}` } : {}),
    },
    // Casting just the body is the "surgical" way to fix the type mismatch
    body: Readable.from(
      ollamaChatJsonBodyGenerator({ model: modelName, messages, attachments }),
    ) as unknown as ReadableStream,
    duplex: 'half',
    signal: abortSignal,
  }

  const response = await pRetry(() => fetch(`${baseUrl}/api/chat`, requestInit), { retries: 3 })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn('Failed to POST streaming ollama api /api/chat ', {
      connection,
      status: response.status,
      responseText,
    })
    throw new Error(`Failed to POST ollama api: ${connection.baseUrl}/api/chat: ${response.status}`)
  }

  if (!response.body) {
    logger.error('Failed to retrieve streaming body for ollama chat streaming api', {
      connection,
      options,
      status: response.status,
    })
    throw new Error(`Failed to retrieve streaming body for ollama chat streaming api on ${connection.baseUrl}/api/chat`)
  }

  // Create a transform stream that parses JSON chunks and respects abort signal
  const transformStream = new TransformStream<string, ChatCompletionStreamChunk>({
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

      // Split by newlines in case multiple JSON objects are in one chunk
      const lines = chunk.split('\n').filter((line) => line.trim())

      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line)
          const parsedChunk = OllamaChatStreamChunkSchema.parse({ ...jsonData, modelName: modelName })
          const commonChunk: ChatCompletionStreamChunk = {
            chunk: parsedChunk.message?.content || '',
            metadata: {
              instanceUrl: baseUrl, // Track which instance processed this
            },
          }
          // Map Ollama's token counts to common format
          if (parsedChunk.prompt_eval_count !== undefined) {
            commonChunk.metadata!.promptTokens = parsedChunk.prompt_eval_count
          }
          if (parsedChunk.eval_count !== undefined) {
            commonChunk.metadata!.completionTokens = parsedChunk.eval_count
          }
          // Calculate total tokens if both are available
          if (parsedChunk.prompt_eval_count !== undefined && parsedChunk.eval_count !== undefined) {
            commonChunk.metadata!.tokensProcessed = parsedChunk.prompt_eval_count + parsedChunk.eval_count
          }

          controller.enqueue(commonChunk)
        } catch (error) {
          logger.warn('Failed to parse OllamaStreamChunk', { line, error })
          // Skip invalid chunks but continue processing
        }
      }
    },
  })

  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(transformStream)
}
