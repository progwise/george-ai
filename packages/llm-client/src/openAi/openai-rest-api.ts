import pRetry from 'p-retry'
import z from 'zod'

import { decryptValue } from '@george-ai/app-commons'
import { OpenAIHostConnection } from '@george-ai/app-schema'

import { DEFAULT_BASE_URL, logger } from './common'

export async function openAIApiGet<T>(
  connection: OpenAIHostConnection,
  endpoint: string,
  schema: z.ZodSchema<T>,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof schema>> {
  const requestInit: RequestInit = {
    headers: { Authorization: `Bearer ${decryptValue(connection.encryptedApiKey)}` },
    signal: abortSignal,
    method: 'GET',
  }

  const response = await pRetry(() => fetch(`${connection.baseUrl || DEFAULT_BASE_URL}${endpoint}`, requestInit), {
    retries: 3,
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn('Failed to GET openai api', {
      connection,
      endpoint,
      status: response.status,
      responseText,
      DEFAULT_BASE_URL,
    })
    throw new Error(
      `Failed to GET openai api: ${connection.baseUrl || DEFAULT_BASE_URL}${endpoint}: ${response.status}`,
    )
  }

  const data = await response.json()
  return schema.parse(data)
}

export async function openAIApiPost<T>(
  connection: OpenAIHostConnection,
  endpoint: string,
  params: unknown,
  schema: z.ZodSchema<T>,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof schema>> {
  const requestInit: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${decryptValue(connection.encryptedApiKey)}`,
    },
    body: JSON.stringify(params),
    signal: abortSignal,
    method: 'POST',
  }
  const response = await pRetry(() => fetch(`${connection.baseUrl || DEFAULT_BASE_URL}${endpoint}`, requestInit), {
    retries: 3,
  })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn('Failed to GET openai api', {
      connection,
      endpoint,
      status: response.status,
      responseText,
      DEFAULT_BASE_URL,
    })
    throw new Error(
      `Failed to POST openai api: ${connection.baseUrl || DEFAULT_BASE_URL}${endpoint}: ${response.status}`,
    )
  }

  const data = await response.json()
  return schema.parse(data)
}
