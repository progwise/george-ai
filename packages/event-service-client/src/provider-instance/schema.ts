import z from 'zod'

import { PROVIDER_HEALTH_STATUS, ProviderConnectionSchema } from '@george-ai/app-commons'
import { MODEL_PROVIDERS } from '@george-ai/app-commons'

export const PROVIDER_INSTANCE_REQUEST_TYPES = ['discoverModels', 'statusReport', 'testConnection'] as const
export type ProviderInstanceRequestType = (typeof PROVIDER_INSTANCE_REQUEST_TYPES)[number]

export const ProviderInstanceSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string().min(1),
  providerInstanceId: z.string().min(1),
  name: z.string().optional(),
  modelProvider: z.enum(MODEL_PROVIDERS),
  connection: ProviderConnectionSchema,
  totalMemoryMb: z.number().optional(),
  usedMemoryMb: z.number().optional(),
  processorUsagePercent: z.number().optional(),
  loadedModelNames: z.array(z.string()).optional(),
  availableModelNames: z.array(z.string()).optional(),
  status: z.enum(PROVIDER_HEALTH_STATUS).optional(),
  timestamp: z.coerce.date().optional(),
})

export type ProviderInstance = z.infer<typeof ProviderInstanceSchema>

export const ProviderInstanceRequestBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  connection: ProviderConnectionSchema,
  requestType: z.enum(PROVIDER_INSTANCE_REQUEST_TYPES),
})

export const RequestDiscoverModelsSchema = ProviderInstanceRequestBaseSchema.extend({
  requestType: z.literal('discoverModels'),
})

export type RequestDiscoverModels = z.infer<typeof RequestDiscoverModelsSchema>

export const ProviderStatusReportRequestSchema = ProviderInstanceRequestBaseSchema.extend({
  requestType: z.literal('statusReport'),
  providerInstanceId: z.string(),
})

export type ProviderStatusReportRequest = z.infer<typeof ProviderStatusReportRequestSchema>

export const ProviderTestConnectionRequestSchema = ProviderInstanceRequestBaseSchema.extend({
  requestType: z.literal('testConnection'),
})

export type ProviderTestConnectionRequest = z.infer<typeof ProviderTestConnectionRequestSchema>

export const ProviderRequestSchema = z.discriminatedUnion('requestType', [
  RequestDiscoverModelsSchema,
  ProviderStatusReportRequestSchema,
  ProviderTestConnectionRequestSchema,
])
export type ProviderRequest = z.infer<typeof ProviderRequestSchema>

export const ProviderResponseBaseSchema = z.object({
  version: z.literal(1),
  resultStatus: z.enum(['success', 'error']),
  errorMessage: z.string().nullable().optional(),
  providerInstanceUrl: z.string().nullable().optional(),
  processingDurationMs: z.number(),
})

export const ProviderModelSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  name: z.string(),
  modelProvider: z.enum(MODEL_PROVIDERS),
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type ProviderModel = z.infer<typeof ProviderModelSchema>

export const DiscoverModelsResponseSchema = ProviderResponseBaseSchema.extend({
  requestType: z.literal('discoverModels'),
  modelProvider: z.enum(MODEL_PROVIDERS),
  models: z.array(ProviderModelSchema),
})

export type DiscoverModelsResponse = z.infer<typeof DiscoverModelsResponseSchema>

export const ProviderStatusReportResponseSchema = ProviderResponseBaseSchema.extend({
  requestType: z.literal('statusReport'),
  isConnected: z.boolean().optional(),
  providerVersion: z.string().optional(),
  latencyMs: z.number().optional(),
  connectionErrorMessage: z.string().optional(),
  processorUsagePercent: z.number().optional(),
  totalMemoryMb: z.number().optional(),
  usedMemoryMb: z.number().optional(),
  loadedModelNames: z.array(z.string()).optional(),
  availableModelNames: z.array(z.string()).optional(),
})

export type ProviderStatusReportResponse = z.infer<typeof ProviderStatusReportResponseSchema>

export const ProviderTestConnectionResponseSchema = ProviderResponseBaseSchema.extend({
  requestType: z.literal('testConnection'),
  success: z.boolean(),
  isOnline: z.boolean().optional(),
  isHealthy: z.boolean().optional(),
  statusMessage: z.string().optional(),
})

export type ProviderTestConnectionResponse = z.infer<typeof ProviderTestConnectionResponseSchema>

export const ProviderResponseSchema = z.discriminatedUnion('requestType', [
  DiscoverModelsResponseSchema,
  ProviderStatusReportResponseSchema,
  ProviderTestConnectionResponseSchema,
])
export type ProviderResponse = z.infer<typeof ProviderResponseSchema>
