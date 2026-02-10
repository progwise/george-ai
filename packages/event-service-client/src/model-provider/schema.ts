import z from 'zod'

import { MODEL_PROVIDERS } from '@george-ai/app-commons'

export const ProviderCallTypeSchema = z.enum(['discoverModels', 'status', 'testConnection'] as const)

export type ProviderCallType = z.infer<typeof ProviderCallTypeSchema>
export const ProviderConnectionSchema = z.object({
  version: z.literal(1),
  baseUrl: z.string().url().optional().nullable(),
  apiKey: z.string().optional().nullable(),
})

export type ProviderConnection = z.infer<typeof ProviderConnectionSchema>

export const ModelProviderInstanceSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  name: z.string().optional(),
  modelProvider: z.enum(MODEL_PROVIDERS),
  connection: ProviderConnectionSchema,
})

export type ModelProviderInstance = z.infer<typeof ModelProviderInstanceSchema>

export const ModelSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  name: z.string(),
  modelProvider: z.enum(MODEL_PROVIDERS),
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type Model = z.infer<typeof ModelSchema>

export const ProviderRequestBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  providerId: z.string().optional().nullable(),
  connection: ProviderConnectionSchema,
  callType: ProviderCallTypeSchema,
})

export const RequestDiscoverModelsSchema = ProviderRequestBaseSchema.extend({
  callType: z.literal('discoverModels'),
})

export type RequestDiscoverModels = z.infer<typeof RequestDiscoverModelsSchema>

export const RequestStatusSchema = ProviderRequestBaseSchema.extend({
  callType: z.literal('status'),
})

export type RequestStatus = z.infer<typeof RequestStatusSchema>

export const RequestTestConnectionSchema = ProviderRequestBaseSchema.extend({
  callType: z.literal('testConnection'),
  modelProvider: z.enum(MODEL_PROVIDERS),
})

export type RequestTestConnection = z.infer<typeof RequestTestConnectionSchema>

export const ProviderRequestSchema = z.discriminatedUnion('callType', [
  RequestDiscoverModelsSchema,
  RequestStatusSchema,
  RequestTestConnectionSchema,
])

export type ProviderRequest = z.infer<typeof ProviderRequestSchema>

export const ProviderResponseBaseSchema = z.object({
  version: z.literal(1),
  provider: ModelProviderInstanceSchema,
})

export const DiscoverModelsResponseSchema = ProviderResponseBaseSchema.extend({
  callType: z.literal('discoverModels'),
  models: z.array(ModelSchema),
})
export type DiscoverModelsResponse = z.infer<typeof DiscoverModelsResponseSchema>
export const ProviderStatusResponseSchema = ProviderResponseBaseSchema.extend({
  callType: z.literal('statusCheck'),
  isHealthy: z.boolean(),
  statusMessage: z.string().optional(),
})
export type ProviderStatusResponse = z.infer<typeof ProviderStatusResponseSchema>
export const TestConnectionResponseSchema = ProviderResponseBaseSchema.extend({
  callType: z.literal('testConnection'),
  isHealthy: z.boolean(),
  isOnline: z.boolean(),
  statusMessage: z.string().optional(),
})
export type TestConnectionResponse = z.infer<typeof TestConnectionResponseSchema>

export const ProviderResponseSchema = z.discriminatedUnion('callType', [
  DiscoverModelsResponseSchema,
  ProviderStatusResponseSchema,
  TestConnectionResponseSchema,
])

export type ProviderResponse = z.infer<typeof ProviderResponseSchema>
