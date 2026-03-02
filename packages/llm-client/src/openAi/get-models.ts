import z from 'zod'

import { OpenAiProviderConnection } from '@george-ai/app-commons'

import { openAIApiGet } from './openai-rest-api'
import { OpenAIModelsResponseSchema } from './schema'

export async function getOpenAIModels(
  connection: OpenAiProviderConnection,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof OpenAIModelsResponseSchema> & { timestamp: number }> {
  const data = await openAIApiGet(connection, '/models', OpenAIModelsResponseSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}
