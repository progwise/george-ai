import z from 'zod'

import { OllamaProviderConnection } from '@george-ai/app-commons'

import { logger } from './common'
import { ollamaApiPost } from './ollama-rest-api'

export async function loadOllamaChatModel(
  connection: OllamaProviderConnection,
  modelName: string,
  abortSignal?: AbortSignal,
) {
  logger.debug('Loading ollama model', { connection, modelName })
  const data = ollamaApiPost(
    connection,
    '/api/chat',
    { model: modelName },
    z.object({ done: z.boolean() }),
    abortSignal,
  )
  return data
}

export async function unloadOllamaChatModel(
  connection: OllamaProviderConnection,
  modelName: string,
  abortSignal?: AbortSignal,
) {
  logger.debug('Unloading ollama model', { connection, modelName })

  const data = ollamaApiPost(
    connection,
    '/api/chat',
    { model: modelName, keep_alive: 0 },
    z.object({ done: z.boolean(), done_reason: z.string() }),
    abortSignal,
  )
  return data
}
