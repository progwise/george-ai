import pRetry from 'p-retry'
import { Readable } from 'stream'

import { decryptValue } from '@george-ai/app-commons'
import { ChatAttachment, ChatMessage, ChatResponseChunk, OllamaHostConnection } from '@george-ai/app-schema'

import { Base64Encoder } from '../base64-encoder'
import { logger } from './common'
import { OllamaChatStreamChunkSchema } from './schema'

export const ollamaChatJsonBodyGenerator = async function* (options: {
  model: string
  messages: ChatMessage[]
  attachments?: (ChatAttachment & { stream: Readable })[]
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
  connection: OllamaHostConnection,
  modelName: string,
  messages: ChatMessage[],
  attachments?: (ChatAttachment & { stream: Readable })[],
  abortSignal?: AbortSignal,
): Promise<ChatResponseChunk> {
  const stream = await getOllamaChatCompletionStream(connection, modelName, messages, attachments, abortSignal)

  const bufferedResult: Array<ChatResponseChunk> = []
  for await (const chunk of stream) {
    bufferedResult.push(chunk)
  }

  const result: ChatResponseChunk = {
    chunk: bufferedResult.map((c) => c.chunk).join(''),
    created: new Date(),
    completionTokens: bufferedResult.reduce((acc, c) => acc + (c.completionTokens || 0), 0),
    promptTokens: bufferedResult.reduce((acc, c) => acc + (c.promptTokens || 0), 0),
  }

  return result
}

export async function getOllamaChatCompletionStream(
  connection: OllamaHostConnection,
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
      messages,
      modelName,
      attachments,
      status: response.status,
    })
    throw new Error(`Failed to retrieve streaming body for ollama chat streaming api on ${connection.baseUrl}/api/chat`)
  }

  // Create a transform stream that parses JSON chunks and respects abort signal
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

      // Split by newlines in case multiple JSON objects are in one chunk
      const lines = chunk.split('\n').filter((line) => line.trim())

      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line)
          const parsedChunk = OllamaChatStreamChunkSchema.parse({ ...jsonData, modelName: modelName })
          const commonChunk: ChatResponseChunk = {
            created: new Date(),
            chunk: parsedChunk.message?.content || '',
            promptTokens: parsedChunk.prompt_eval_count,
            completionTokens: parsedChunk.eval_count,
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
