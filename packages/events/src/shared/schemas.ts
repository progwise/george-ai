import z from 'zod'

// Shared base schema for content processing events
export const ContentProcessingEventBaseSchema = z.object({
  eventName: z.string(),
  timestamp: z.string(),
  timeoutMs: z.number(),
  processingTaskId: z.string(),
  workspaceId: z.string(),
  libraryId: z.string(),
  fileId: z.string(),
  part: z.number().optional(),
})

export type ContentProcessingEventBase = z.infer<typeof ContentProcessingEventBaseSchema>

// Shared provider configuration schema
export const WorkspaceProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
})

export type WorkspaceProvider = z.infer<typeof WorkspaceProviderSchema>

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
