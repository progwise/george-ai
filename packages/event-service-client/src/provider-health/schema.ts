import z from 'zod'

import { ProviderInstanceSchema } from '../provider/schema'

export const ProviderHealthSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  providerInstance: ProviderInstanceSchema,
  totalMemoryMb: z.number().optional(),
  usedMemoryMb: z.number().optional(),
  processorUsagePercent: z.number().optional(),
  loadedModelNames: z.array(z.string()).optional(),
  availableModelNames: z.array(z.string()).optional(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(), // ISO date string
})

export type ProviderHealth = z.infer<typeof ProviderHealthSchema>
