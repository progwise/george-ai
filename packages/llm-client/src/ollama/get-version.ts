import { OllamaProviderConnection } from '@george-ai/app-commons'

import { ollamaApiGet } from './ollama-rest-api'
import { OllamaVersion, OllamaVersionSchema } from './schema'

export async function getOllamaVersion(
  connection: OllamaProviderConnection,
  abortSignal?: AbortSignal,
): Promise<OllamaVersion> {
  const data = await ollamaApiGet(connection, '/api/version', OllamaVersionSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}
