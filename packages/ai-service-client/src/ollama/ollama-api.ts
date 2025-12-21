import { z } from 'zod'

import { createLogger } from '@george-ai/web-utils'

import { Message } from '../types'

const logger = createLogger('Ollama API')

const OllamaModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  size: z.number(),
  digest: z.string().optional(),
  details: z
    .object({
      parameter_size: z.string().optional(),
      quantization_level: z.string().optional(),
      family: z.string().optional(),
      families: z.array(z.string()).optional(),
      parent_model: z.string().optional(),
      format: z.string().optional(),
    })
    .optional(),
})

export type OllamaModel = z.infer<typeof OllamaModelSchema>

const OllamaModelsResponseSchema = z.object({
  models: z.array(OllamaModelSchema),
})

const OllamaModelInfoSchema = z.object({
  modelfile: z.string(),
  parameters: z.string().optional(),
  template: z.string(),
  details: z.object({
    parent_model: z.string(),
    format: z.string(),
    family: z.string(),
    families: z.array(z.string()),
    parameter_size: z.string(), // e.g. "8.0B"
    quantization_level: z.string(), // e.g. "Q4_0"
  }),
  model_info: z
    .object({
      'general.architecture': z.string().optional(),
      'general.file_type': z.number().optional(),
      'general.parameter_count': z.number().optional(),
      'general.quantization_version': z.number().optional(),

      'llama.attention.head_count': z.number().optional(),
      'llama.attention.head_count_kv': z.number().optional(),
      'llama.attention.layer_norm_rms_epsilon': z.number().optional(),
      'llama.block_count': z.number().optional(),
      'llama.context_length': z.number().optional(),
      'llama.embedding_length': z.number().optional(),
      'llama.feed_forward_length': z.number().optional(),
      'llama.rope.dimension_count': z.number().optional(),
      'llama.rope.freq_base': z.number().optional(),
      'llama.vocab_size': z.number().optional(),

      'tokenizer.ggml.bos_token_id': z.number().optional(),
      'tokenizer.ggml.eos_token_id': z.number().optional(),
      'tokenizer.ggml.merges': z.array(z.any()).nullable().optional(),
      'tokenizer.ggml.model': z.string().optional(),
      'tokenizer.ggml.pre': z.string().optional(),
      'tokenizer.ggml.token_type': z.array(z.any()).nullable().optional(),
      'tokenizer.ggml.tokens': z.array(z.any()).nullable().optional(),
    })
    // Allow unknown/extra keys that some models expose:
    .passthrough(),
})

export type OllamaModelInfo = z.infer<typeof OllamaModelInfoSchema> & { timestamp: number }

const OllamaVersionSchema = z.object({
  version: z.string().optional(),
})

export type OllamaVersion = z.infer<typeof OllamaVersionSchema> & { timestamp: number }

const OllamaRunningModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  digest: z.string(),
  size: z.number(),
  size_vram: z.number(),
  expires_at: z.string(),
  details: z.object({
    parent_model: z.string(),
    format: z.string(),
    family: z.string(),
    families: z.array(z.string()),
    parameter_size: z.string(),
    quantization_level: z.string(),
  }),
})

export type OllamaRunningModel = z.infer<typeof OllamaRunningModelSchema>

const OllamaRunningModelsResponseSchema = z.object({
  models: z.array(OllamaRunningModelSchema),
})

const OllamaCompletionSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string().optional(),
  done: z.boolean().optional(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
  context: z.array(z.number()).optional(),
})

const OllamaStreamChunkSchema = z.object({
  model: z.string().optional(),
  modelName: z.string(), // Added field to track which model this chunk is from
  message: z
    .object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().optional(),
      images: z.array(z.string()).optional(), // base64 encoded images
    })
    .optional(),
  error: z.string().optional(),
  done: z.boolean().optional(), // Error-only chunks might not have done field
  context: z.array(z.number()).optional(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
})

export type OllamaStreamChunk = z.infer<typeof OllamaStreamChunkSchema>

interface FetchParams {
  url: string
  apiKey?: string
}

async function ollamaApiGet<T>(
  instance: FetchParams,
  endpoint: string,
  schema: z.ZodSchema<T>,
): Promise<z.infer<typeof schema>> {
  const response = await fetch(`${instance.url}${endpoint}`, {
    headers: instance.apiKey ? { Authorization: `Bearer ${instance.apiKey}` } : {},
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn(`Failed to fetch ${endpoint}:`, { status: response.status, responseText })
    throw new Error(`Failed to fetch OLLAMA API ${endpoint}: ${response.status}`)
  }

  const data = await response.json()
  return schema.parse(data)
}

async function ollamaApiPost<T>(
  instance: FetchParams,
  endpoint: string,
  params: unknown,
  schema: z.ZodSchema<T>,
): Promise<z.infer<typeof schema>> {
  const response = await fetch(`${instance.url}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(instance.apiKey ? { Authorization: `Bearer ${instance.apiKey}` } : {}),
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn(`Failed to POST ${endpoint}:`, { status: response.status, responseText })
    throw new Error(`Failed to POST OLLAMA API ${endpoint}: ${response.status}`)
  }

  const data = await response.json()
  return schema.parse(data)
}

async function getOllamaVersion(params: FetchParams): Promise<OllamaVersion> {
  const data = await ollamaApiGet(params, '/api/version', OllamaVersionSchema)
  return { ...data, timestamp: Date.now() }
}

async function getOllamaModels(
  params: FetchParams,
): Promise<z.infer<typeof OllamaModelsResponseSchema> & { timestamp: number }> {
  const data = await ollamaApiGet(params, '/api/tags', OllamaModelsResponseSchema)
  return { ...data, timestamp: Date.now() }
}

async function getOllamaRunningModels(
  params: FetchParams,
): Promise<z.infer<typeof OllamaRunningModelsResponseSchema> & { timestamp: number }> {
  const data = await ollamaApiGet(params, '/api/ps', OllamaRunningModelsResponseSchema)
  return { ...data, timestamp: Date.now() }
}

async function getOllamaModelInfo(params: FetchParams, modelName: string): Promise<OllamaModelInfo> {
  const data = await ollamaApiPost(params, '/api/show', { model: modelName }, OllamaModelInfoSchema)
  return { ...data, timestamp: Date.now() }
}

async function getCompletion(params: FetchParams, modelName: string, prompt: string, images?: string[]) {
  const data = await ollamaApiPost(
    params,
    '/api/generate',
    { model: modelName, prompt, images, stream: false },
    OllamaCompletionSchema,
  )
  return data
}

async function getChatResponseStream(
  params: FetchParams,
  modelName: string,
  messages: Message[],
  abortSignal?: AbortSignal,
): Promise<ReadableStream<OllamaStreamChunk>> {
  let response: Response
  try {
    response = await fetch(`${params.url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(params.apiKey ? { Authorization: `Bearer ${params.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: modelName, stream: true, messages }),
      signal: abortSignal,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn('Network error connecting:', {
      error: errorMessage,
      model: modelName,
      url: params.url,
    })
    throw new Error(`Network error connecting to Ollama at ${params.url}: ${errorMessage}\nModel: ${modelName}`)
  }

  if (!response.ok) {
    let responseText = ''
    try {
      responseText = await response.text()
    } catch (error) {
      logger.warn('Failed to read error response body:', error)
    }
    logger.warn('Failed to receive stream:', {
      status: response.status,
      statusText: response.statusText,
      responseText,
      model: modelName,
      url: params.url,
    })
    throw new Error(
      `Failed to receive stream from Ollama: ${response.status} ${response.statusText}\n` +
        `Model: ${modelName}\nURL: ${params.url}\n` +
        `Response: ${responseText}`,
    )
  }

  if (!response.body) {
    throw new Error(`No response body stream from Ollama (URL: ${params.url}, Model: ${modelName})`)
  }

  // Create a transform stream that parses JSON chunks and respects abort signal
  const transformStream = new TransformStream<string, OllamaStreamChunk>({
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
          const parsedChunk = OllamaStreamChunkSchema.parse({ ...jsonData, modelName: modelName })
          controller.enqueue(parsedChunk)
        } catch (error) {
          logger.warn('Failed to parse JSON chunk:', { line, error })
          // Skip invalid chunks but continue processing
        }
      }
    },
  })

  return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(transformStream)
}

async function loadOllamaModel(params: FetchParams, modelName: string): Promise<{ done: boolean }> {
  logger.info(`Loading model ${modelName}...`)
  const data = ollamaApiPost(params, '/api/chat', { model: modelName }, z.object({ done: z.boolean() }))
  return data
}

async function unloadOllamaModel(
  params: FetchParams,
  modelName: string,
): Promise<{ done: boolean; done_reason: string }> {
  const data = ollamaApiPost(
    params,
    '/api/chat',
    { model: modelName, keep_alive: 0 },
    z.object({ done: z.boolean(), done_reason: z.string() }),
  )
  return data
}

async function generateOllamaEmbeddings(
  params: FetchParams,
  modelName: string,
  input: string | string[],
): Promise<{ embeddings: number[][] }> {
  const data = ollamaApiPost(
    params,
    '/api/embed',
    { model: modelName, input },
    z.object({ embeddings: z.array(z.array(z.number())) }),
  )
  return data
}

export {
  getOllamaModels,
  getOllamaVersion,
  getOllamaRunningModels,
  getOllamaModelInfo,
  loadOllamaModel,
  unloadOllamaModel,
  generateOllamaEmbeddings,
  getChatResponseStream,
  getCompletion,
}
