import z from 'zod'

import { PROVIDER_HEALTH_STATUS } from '@george-ai/app-commons'

import { ModelProviderInstanceSchema } from '../model-provider/schema'

export const ProviderHealthSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  providerInstance: ModelProviderInstanceSchema,
  totalMemoryMb: z.number().optional(),
  usedMemoryMb: z.number().optional(),
  processorUsagePercent: z.number().optional(),
  loadedModelNames: z.array(z.string()).optional(),
  availableModelNames: z.array(z.string()).optional(),
  status: z.enum(PROVIDER_HEALTH_STATUS),
  timestamp: z.string(), // ISO date string
})

export type ProviderHealth = z.infer<typeof ProviderHealthSchema>
