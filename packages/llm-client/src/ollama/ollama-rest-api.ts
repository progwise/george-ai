import pRetry from 'p-retry'
import { z } from 'zod'

import { OllamaProviderConnection, decryptValue } from '@george-ai/app-commons'

import { logger } from './common'

export async function ollamaApiGet<T>(
  connection: OllamaProviderConnection,
  endpoint: string,
  schema: z.ZodSchema<T>,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof schema>> {
  const requestInit: RequestInit = {
    headers: connection.encryptedApiKey ? { Authorization: `Bearer ${decryptValue(connection.encryptedApiKey)}` } : {},
    signal: abortSignal,
    method: 'GET',
  }
  const response = await pRetry(() => fetch(`${connection.baseUrl}${endpoint}`, requestInit), { retries: 3 })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn('Failed to GET ollama api', {
      connection,
      endpoint,
      status: response.status,
      responseText,
    })
    throw new Error(`Failed to GET ollama api: ${connection.baseUrl}${endpoint}: ${response.status}`)
  }

  const data = await response.json()
  return schema.parse(data)
}

export async function ollamaApiPost<T>(
  connection: OllamaProviderConnection,
  endpoint: string,
  params: unknown,
  schema: z.ZodSchema<T>,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof schema>> {
  const requestInit: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(connection.encryptedApiKey ? { Authorization: `Bearer ${decryptValue(connection.encryptedApiKey)}` } : {}),
    },
    body: JSON.stringify(params),
    signal: abortSignal,
    method: 'POST',
  }
  const response = await pRetry(() => fetch(`${connection.baseUrl}${endpoint}`, requestInit), { retries: 3 })

  if (!response.ok) {
    const responseText = await response.text()
    logger.warn(`Failed to POST ollama api`, { connection, endpoint, status: response.status, responseText })
    throw new Error(`Failed to POST OLLAMA API ${connection.baseUrl}${endpoint}: ${response.status}`)
  }

  const data = await response.json()
  return schema.parse(data)
}
