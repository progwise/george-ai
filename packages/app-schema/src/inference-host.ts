import z from 'zod'

import { InferenceDriverSchema } from './inference'

export const INFERENCE_HOST_ACTIONS = ['connectionTest', 'healthStatus', 'modelDiscovery'] as const
export type InferenceHostAction = (typeof INFERENCE_HOST_ACTIONS)[number]
export const InferenceHostActionSchema = z.enum(INFERENCE_HOST_ACTIONS)

const InferenceHostConnectionBaseSchema = z.object({
  driver: InferenceDriverSchema,
})

export const OllamaHostConnectionSchema = InferenceHostConnectionBaseSchema.extend({
  driver: z.literal('ollama').default('ollama'),
  baseUrl: z.string().url(),
  encryptedApiKey: z.string().nullish(),
})

export type OllamaHostConnection = z.infer<typeof OllamaHostConnectionSchema>

export const OpenAIHostConnectionSchema = InferenceHostConnectionBaseSchema.extend({
  driver: z.literal('openai').default('openai'),
  baseUrl: z.string().url().optional(),
  encryptedApiKey: z.string().min(3),
})

export type OpenAIHostConnection = z.infer<typeof OpenAIHostConnectionSchema>

export const InferenceHostConnectionSchema = z.discriminatedUnion('driver', [
  OllamaHostConnectionSchema,
  OpenAIHostConnectionSchema,
])

export type InferenceHostConnection = z.infer<typeof InferenceHostConnectionSchema>

export const InferenceHostStatusReportSchema = z.object({
  url: z.string(),
  isConnected: z.boolean(),
  version: z.string().optional(),
  latencyMs: z.number().optional(),
  connectionErrorMessage: z.string().optional(),
  totalMemoryMb: z.number().optional(),
  usedMemoryMb: z.number().optional(),
  processorUsagePercent: z.number().optional(),
  loadedModelNames: z.array(z.string()).optional(),
  availableModelNames: z.array(z.string()).optional(),
})

export type InferenceHostStatusReport = z.infer<typeof InferenceHostStatusReportSchema>
