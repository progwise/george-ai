import z from 'zod'

// Shared provider configuration schema
export const WorkspaceProviderInstanceSchema = z.object({
  id: z.string(),
  provider: z.string(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
})

export type WorkspaceProviderInstance = z.infer<typeof WorkspaceProviderInstanceSchema>

export const WorkspaceLanguageModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  canDoEmbedding: z.boolean(),
  canDoChatCompletion: z.boolean(),
  canDoVision: z.boolean(),
  canDoFunctionCalling: z.boolean(),
})

export type WorkspaceLanguageModel = z.infer<typeof WorkspaceLanguageModelSchema>
export const WorkspaceRegistrySchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  lastUpdate: z.string(), // ISO date string
  providerInstances: z.array(WorkspaceProviderInstanceSchema),
  languageModels: z.array(WorkspaceLanguageModelSchema),
})

export type WorkspaceRegistryEntry = z.infer<typeof WorkspaceRegistrySchema>
