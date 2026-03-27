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
  modelOptions?: Record<string, unknown>
}) {
  const { model, messages, attachments, modelOptions } = options
  const encoder = new TextEncoder()

  yield encoder.encode(
    JSON.stringify({
      model,
      stream: true, // false does not work: Ollama Bug.
      options: { num_ctx: 8192, ...modelOptions },
    }).slice(0, -1) + ',"messages":[',
  )

  for (let i = 0; i < messages.length - 1; i++) {
    const message = messages[i]
    if (i > 0) yield encoder.encode(',')
    yield encoder.encode(` { "role":"${message.role}", "content": ${JSON.stringify(message.content)} }`)
  }

  const lastMessage = messages[messages.length - 1]

  if (messages.length > 1) yield encoder.encode(',')
  yield encoder.encode(
    ` { "role":"${lastMessage.role}", "content": ${JSON.stringify(lastMessage.content)}, "images": [`,
  )

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
  modelOptions?: Record<string, unknown>,
): Promise<ChatResponseChunk> {
  const stream = await getOllamaChatCompletionStream(
    connection,
    modelName,
    messages,
    attachments,
    abortSignal,
    modelOptions,
  )

  const bufferedResult: Array<ChatResponseChunk> = []
  for await (const chunk of stream) {
    bufferedResult.push(chunk)
  }

  const result: ChatResponseChunk = {
    completionLine: bufferedResult.map((c) => c.completionLine).join('\n'),
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
  modelOptions?: Record<string, unknown>,
): Promise<ReadableStream<ChatResponseChunk>> {
  const { baseUrl, encryptedApiKey } = connection

  const requestInit: RequestInit & { duplex: 'half'; stream: true } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(encryptedApiKey ? { Authorization: `Bearer ${decryptValue(encryptedApiKey)}` } : {}),
    },
    // Casting just the body is the "surgical" way to fix the type mismatch
    body: Readable.from(
      ollamaChatJsonBodyGenerator({ model: modelName, messages, attachments, modelOptions }),
    ) as unknown as ReadableStream,
    duplex: 'half',
    stream: true,
    signal: abortSignal,
  }

  const response = await pRetry(() => fetch(`${baseUrl}/api/chat`, requestInit), { retries: 3 }).catch((error) => {
    logger.error('Error during fetch to ollama chat streaming API', {
      baseUrl,
      modelName,
      messages,
      attachments,
      error,
    })
    throw error
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn('Failed to POST streaming ollama api /api/chat ', {
      connection,
      status: response.status,
      responseText,
      messages,
    })

    const readableRequestBody = Readable.from(
      ollamaChatJsonBodyGenerator({ model: modelName, messages, attachments, modelOptions }),
    )

    const readableRequestBodyContent: { line: number; content: string }[] = []
    let line = 0

    for await (const chunk of readableRequestBody) {
      readableRequestBodyContent.push({
        line: line++,
        content: chunk instanceof Uint8Array ? new TextDecoder().decode(chunk) : chunk,
      })
    }

    logger.info('Readable request body content for failed ollama chat request', { readableRequestBodyContent })
    const parsed = JSON.parse(readableRequestBodyContent.map((c) => c.content).join(''))
    logger.info('Parsed request body content for failed ollama chat request', { parsed })

    throw new Error(
      `Failed to POST ollama api: ${connection.baseUrl}/api/chat: ${response.status}: ${responseText} - ${response.statusText}`,
    )
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

  // Separate line buffers for thinking and content — persist across transform() calls
  let thinkingLine = ''
  let completionLine = ''

  const enqueueLine = (
    controller: TransformStreamDefaultController<ChatResponseChunk>,
    text: string,
    field: 'thinking' | 'completion',
    parsedChunk: { prompt_eval_count?: number; eval_count?: number },
  ) => {
    const newlineIndex = text.indexOf('\n')
    if (field === 'thinking') {
      if (newlineIndex === -1) {
        thinkingLine += text
      } else {
        controller.enqueue({
          created: new Date(),
          thinkingLine: thinkingLine + text.slice(0, newlineIndex),
          promptTokens: parsedChunk.prompt_eval_count,
          completionTokens: parsedChunk.eval_count,
        })
        thinkingLine = text.slice(newlineIndex + 1)
      }
    } else {
      if (newlineIndex === -1) {
        completionLine += text
      } else {
        controller.enqueue({
          created: new Date(),
          completionLine: completionLine + text.slice(0, newlineIndex),
          promptTokens: parsedChunk.prompt_eval_count,
          completionTokens: parsedChunk.eval_count,
        })
        completionLine = text.slice(newlineIndex + 1)
      }
    }
  }

  // Create a transform stream that parses JSON chunks and respects abort signal
  const transformStream = new TransformStream<string, ChatResponseChunk>({
    start(controller) {
      // Listen for abort signal and close the stream
      abortSignal?.addEventListener('abort', () => {
        controller.terminate()
      })
    },
    transform(rawChunk, controller) {
      // Check if aborted before processing
      if (abortSignal?.aborted) {
        controller.terminate()
        return
      }

      // Split by newlines in case multiple JSON objects are in one chunk
      const lines = rawChunk.split('\n').filter((line) => line.trim())

      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line)
          const parsedChunk = OllamaChatStreamChunkSchema.parse({ ...jsonData, modelName: modelName })
          const rawThinking = parsedChunk.message?.thinking || ''
          const rawCompletion = parsedChunk.message?.content || ''

          if (rawThinking) enqueueLine(controller, rawThinking, 'thinking', parsedChunk)
          if (rawCompletion) enqueueLine(controller, rawCompletion, 'completion', parsedChunk)
        } catch (error) {
          logger.warn('Failed to parse OllamaStreamChunk', { line, error })
          // Skip invalid chunks but continue processing
        }
      }
    },
    flush(controller) {
      if (thinkingLine) {
        controller.enqueue({ created: new Date(), thinkingLine })
      }
      if (completionLine) {
        controller.enqueue({ created: new Date(), completionLine })
      }
    },
  })

  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(transformStream)
}
