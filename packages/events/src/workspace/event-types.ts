import z from 'zod'

import { FileConverterOptionsSchema, FileConverterResultSchema } from '@george-ai/file-converter'

import { FileEmbeddingOptionsSchema, FileEmbeddingResultSchema } from '../../../vector-store-client/src'

// Workspace-scoped events - All events for a specific workspace

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

export type ConntentProcessingEventBase = z.infer<typeof ContentProcessingEventBaseSchema>

export const ContentExtractionRequestEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('content-extraction-request'),
  mimeType: z.string(),
  fileConverterOptions: FileConverterOptionsSchema,
})

export type ContentExtractionRequestEvent = z.infer<typeof ContentExtractionRequestEventSchema>

export const ContentExtractionFinishedEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('content-extraction-finished'),
  fileConverterResult: FileConverterResultSchema,
})

export type ContentExtractionFinishedEvent = z.infer<typeof ContentExtractionFinishedEventSchema>

export const EmbeddingRequestEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('file-embedding-request'),
  markdownFilename: z.string(),
  fileEmbeddingOptions: FileEmbeddingOptionsSchema,
})

export type EmbeddingRequestEvent = z.infer<typeof EmbeddingRequestEventSchema>

export const EmbeddingProgressEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('file-embedding-progress'),
  progress: z.object({
    chunksProcessed: z.number(),
    chunksTotal: z.number(),
    percentComplete: z.number().min(0).max(100),
    currentOperation: z.string(),
  }),
})

export type EmbeddingProgressEvent = z.infer<typeof EmbeddingProgressEventSchema>

export const FileEmbeddingFinishedEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('file-embedding-finished'),
  fileEmbeddingResult: FileEmbeddingResultSchema,
})

export type EmbeddingFinishedEvent = z.infer<typeof FileEmbeddingFinishedEventSchema>

export const WorkspaceProviderConfigEventSchema = z.object({
  eventName: z.literal('workspace-provider-config'),
  workspaceId: z.string(),
  providers: z.array(
    z.object({
      providerId: z.string(),
      providerType: z.enum(['ollama', 'openai', 'anthropic']),
      baseUrl: z.string().url(),
      apiKey: z.string().optional(),
      enabled: z.boolean(),
      models: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          capabilities: z.array(z.string()),
        }),
      ),
    }),
  ),
  timestamp: z.string().datetime(),
})

export type WorkspaceProviderConfigEvent = z.infer<typeof WorkspaceProviderConfigEventSchema>

export const AiUsageTrackingEventSchema = z.object({
  eventName: z.literal('ai-usage-tracking'),
  workspaceId: z.string(),
  modelId: z.string(),
  operation: z.enum(['embed', 'chat', 'vision']),
  tokensUsed: z.number(),
  duration: z.number(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  timestamp: z.string().datetime(),
})
export type AiUsageTrackingEvent = z.infer<typeof AiUsageTrackingEventSchema>
