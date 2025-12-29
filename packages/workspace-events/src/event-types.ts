import z from 'zod'

import { FileConverterOptionsSchema, FileConverterResultSchema } from '@george-ai/file-converter'

import { FileEmbeddingOptionsSchema, FileEmbeddingResultSchema } from '../../vector-store-client/src'

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

export const FileEmbeddingFinishedEventSchema = ContentProcessingEventBaseSchema.extend({
  eventName: z.literal('file-embedding-finished'),
  fileEmbeddingResult: FileEmbeddingResultSchema,
})

export type FileEmbeddingFinishedEvent = z.infer<typeof FileEmbeddingFinishedEventSchema>
