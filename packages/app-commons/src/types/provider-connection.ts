import z from 'zod'

import { MODEL_PROVIDERS } from './model-provider'

const ProviderConnectionBaseSchema = z.object({
  modelProvider: z.enum(MODEL_PROVIDERS),
})

export const OllamaProviderConnectionSchema = ProviderConnectionBaseSchema.extend({
  modelProvider: z.literal('ollama'),
  baseUrl: z.string().url(),
  encryptedApiKey: z.string().optional().nullable(),
})

export type OllamaProviderConnection = z.infer<typeof OllamaProviderConnectionSchema>

export const OpenAiProviderConnectionSchema = z.object({
  modelProvider: z.literal('openai'),
  baseUrl: z.string().url().optional(),
  encryptedApiKey: z.string().min(3),
})

export type OpenAiProviderConnection = z.infer<typeof OpenAiProviderConnectionSchema>

export const ProviderConnectionSchema = z.discriminatedUnion('modelProvider', [
  OllamaProviderConnectionSchema,
  OpenAiProviderConnectionSchema,
])

export type ProviderConnection = z.infer<typeof ProviderConnectionSchema>
