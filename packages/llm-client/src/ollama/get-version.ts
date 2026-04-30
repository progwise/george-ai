import { OllamaHostConnection } from '@george-ai/app-schema'

import { ollamaApiGet } from './ollama-rest-api'
import { OllamaVersion, OllamaVersionSchema } from './schema'

export async function getOllamaVersion(
  connection: OllamaHostConnection,
  abortSignal?: AbortSignal,
): Promise<OllamaVersion> {
  const data = await ollamaApiGet(connection, '/api/version', OllamaVersionSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}
