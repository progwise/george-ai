import z from 'zod'

import { PROVIDERS } from './common'

export const ProviderInstanceSchema = z.object({
  id: z.string(),
  provider: z.enum(PROVIDERS),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
})

export type ProviderInstance = z.infer<typeof ProviderInstanceSchema>

export const ProviderModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(PROVIDERS),
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type ProviderModel = z.infer<typeof ProviderModelSchema>
