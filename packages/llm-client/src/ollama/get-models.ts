import z from 'zod'

import { OllamaHostConnection } from '@george-ai/app-schema'

import { ollamaApiGet, ollamaApiPost } from './ollama-rest-api'
import {
  OllamaModelInfo,
  OllamaModelInfoSchema,
  OllamaModelsResponseSchema,
  OllamaRunningModelsResponseSchema,
} from './schema'

export async function getOllamaModels(
  connection: OllamaHostConnection,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof OllamaModelsResponseSchema> & { timestamp: number }> {
  const data = await ollamaApiGet(connection, '/api/tags', OllamaModelsResponseSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}

export async function getOllamaRunningModels(
  connection: OllamaHostConnection,
  abortSignal?: AbortSignal,
): Promise<z.infer<typeof OllamaRunningModelsResponseSchema> & { timestamp: number }> {
  const data = await ollamaApiGet(connection, '/api/ps', OllamaRunningModelsResponseSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}

export async function getOllamaModelInfo(
  connection: OllamaHostConnection,
  modelName: string,
  abortSignal?: AbortSignal,
): Promise<OllamaModelInfo> {
  const data = await ollamaApiPost(connection, '/api/show', { model: modelName }, OllamaModelInfoSchema, abortSignal)
  return { ...data, timestamp: Date.now() }
}
