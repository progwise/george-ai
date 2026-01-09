import { z } from 'zod'

import { createLogger, decryptValue } from '@george-ai/web-utils'

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

const OpenAIChatCompletionChunkSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion.chunk'),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({
        role: z.enum(['system', 'user', 'assistant']).optional(),
        content: z.string().optional(),
      }),
      finish_reason: z.string().nullable(),
    }),
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullish(),
})

export type OpenAIChatCompletionChunk = z.infer<typeof OpenAIChatCompletionChunkSchema>

interface FetchParams {
  url: string
  apiKey: string
}

async function openAIApiGet<T>(
  instance: FetchParams,
  endpoint: string,
  schema: z.ZodSchema<T>,
): Promise<z.infer<typeof schema>> {
  const decryptedApiKey = instance.apiKey ? decryptValue(instance.apiKey) || undefined : undefined
  let response: Response
  try {
    response = await fetch(`${instance.url}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${decryptedApiKey}`,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn('Network error connecting to OpenAI:', {
      error: errorMessage,
      endpoint,
      url: instance.url,
    })
    throw new Error(`Network error connecting to OpenAI at ${instance.url}: ${errorMessage}\nEndpoint: ${endpoint}`)
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
      url: instance.url,
    })
    throw new Error(
      `Failed to fetch OpenAI API: ${response.status} ${response.statusText}\n` +
        `Endpoint: ${endpoint}\nURL: ${instance.url}\n` +
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
  const decryptedApiKey = instance.apiKey ? decryptValue(instance.apiKey) || undefined : undefined
  let response: Response
  try {
    response = await fetch(`${instance.url}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${decryptedApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn('Network error connecting to OpenAI:', {
      error: errorMessage,
      endpoint,
      url: instance.url,
    })
    throw new Error(`Network error connecting to OpenAI at ${instance.url}: ${errorMessage}\nEndpoint: ${endpoint}`)
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
      url: instance.url,
    })
    throw new Error(
      `Failed to POST OpenAI API: ${response.status} ${response.statusText}\n` +
        `Endpoint: ${endpoint}\nURL: ${instance.url}\n` +
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

export { OpenAIChatCompletionChunkSchema }
