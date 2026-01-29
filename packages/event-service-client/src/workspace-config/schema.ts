import z from 'zod'

import { default as provider } from '../model-provider'

export const WorkspaceConfigSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  lastUpdate: z.string(), // ISO date string
  providerInstances: z.array(provider.ModelProviderInstanceSchema),
  languageModels: z.array(provider.ModelSchema),
})

export type WorkspaceConfig = z.infer<typeof WorkspaceConfigSchema>
