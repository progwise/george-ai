import z from 'zod'

import { MODEL_PROVIDERS } from '@george-ai/app-commons'

export const ModelProviderInstanceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  modelProvider: z.enum(MODEL_PROVIDERS),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
})

export type ModelProviderInstance = z.infer<typeof ModelProviderInstanceSchema>

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  modelProvider: z.enum(MODEL_PROVIDERS),
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type Model = z.infer<typeof ModelSchema>
