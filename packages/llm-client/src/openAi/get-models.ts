import z from 'zod'

import { OpenAIHostConnection } from '@george-ai/app-schema'

import { openAIApiGet } from './openai-rest-api'
import { OpenAIModelsResponseSchema } from './schema'

export async function getOpenAIModels(
  connection: OpenAIHostConnection,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof OpenAIModelsResponseSchema> & { timestamp: number }> {
  const data = await openAIApiGet(connection, '/models', OpenAIModelsResponseSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}
