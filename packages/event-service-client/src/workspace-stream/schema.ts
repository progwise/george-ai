import z from 'zod'

export enum WorkspaceEventType {
  EmbeddingRequest = 'embedding-request',
  EmbeddingProgress = 'embedding-progress',
  EmbeddingFinished = 'embedding-finished',
  ExtractionRequest = 'extraction-request',
}

export const WorkspaceEventBaseSchema = z.object({
  version: z.literal(1),
  eventType: z.string(),
  workspaceId: z.string(),
})

export const WorkspaceFileEmbeddingRequestEventSchema = WorkspaceEventBaseSchema.extend({
  eventType: z.literal(WorkspaceEventType.EmbeddingRequest),
  libraryId: z.string(),
  fileId: z.string(),
  markdownFilename: z.string(),
  embeddingModelProvider: z.string(),
  embeddingModelName: z.string(),
})

export type WorkspaceFileEmbeddingRequestEvent = z.infer<typeof WorkspaceFileEmbeddingRequestEventSchema>

export const WorkspaceFileEmbeddingFinishedEventSchema = WorkspaceEventBaseSchema.extend({
  eventType: z.literal(WorkspaceEventType.EmbeddingFinished),
  libraryId: z.string(),
  fileId: z.string(),
  chunkCount: z.number(),
  chunkSize: z.number(),
  processingTimeMs: z.number(),
  message: z.string().optional(),
  success: z.boolean(),
})

export type WorkspaceFileEmbeddingFinishedEvent = z.infer<typeof WorkspaceFileEmbeddingFinishedEventSchema>

export const WorkspaceFileEmbeddingProgressEventSchema = WorkspaceEventBaseSchema.extend({
  eventType: z.literal(WorkspaceEventType.EmbeddingProgress),
  libraryId: z.string(),
  fileId: z.string(),
  processedChunks: z.number(),
  totalChunks: z.number(),
})

export type WorkspaceFileEmbeddingProgressEvent = z.infer<typeof WorkspaceFileEmbeddingProgressEventSchema>

export const WorkerFileExtractionRequestEventSchema = WorkspaceEventBaseSchema.extend({
  eventType: z.literal(WorkspaceEventType.ExtractionRequest),
  libraryId: z.string(),
  fileId: z.string(),
  method: z.string(),
})

export type WorkerFileExtractionRequestEvent = z.infer<typeof WorkerFileExtractionRequestEventSchema>

export type WorkspaceEvent =
  | WorkspaceFileEmbeddingRequestEvent
  | WorkspaceFileEmbeddingProgressEvent
  | WorkspaceFileEmbeddingFinishedEvent
  | WorkerFileExtractionRequestEvent

export const WorkspaceEventSchema = z.discriminatedUnion('eventType', [
  WorkspaceFileEmbeddingRequestEventSchema,
  WorkspaceFileEmbeddingProgressEventSchema,
  WorkspaceFileEmbeddingFinishedEventSchema,
  WorkerFileExtractionRequestEventSchema,
])
