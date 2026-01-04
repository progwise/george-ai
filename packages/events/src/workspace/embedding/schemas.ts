import z from 'zod'

import { FileEmbeddingOptionsSchema, FileEmbeddingResultSchema } from '@george-ai/vector-store-client'

import { ContentProcessingEventBaseSchema } from '../../shared/schemas'

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

export const EmbeddingFinishedEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('file-embedding-finished'),
  fileEmbeddingResult: FileEmbeddingResultSchema,
})

export type EmbeddingFinishedEvent = z.infer<typeof EmbeddingFinishedEventSchema>
