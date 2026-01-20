import z from 'zod'

import { ProviderInstanceSchema, ProviderModelSchema } from '../provider'

export const WorkspaceConfigSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  lastUpdate: z.string(), // ISO date string
  providerInstances: z.array(ProviderInstanceSchema),
  languageModels: z.array(ProviderModelSchema),
})

export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>
