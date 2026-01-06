import z from 'zod'

export enum ManagementEventType {
  StartEmbedding = 'start-embedding',
  StopEmbedding = 'stop-embedding',
  StartContentExtraction = 'start-content-extraction',
  StopContentExtraction = 'stop-content-extraction',
}

export const ManagementEventBaseSchema = z.object({
  version: z.literal(1),
  eventType: z.nativeEnum(ManagementEventType),
  workspaceId: z.string(),
})

export type ManagementEvent = z.infer<typeof ManagementEventBaseSchema>

export const StartEmbeddingEventSchema = ManagementEventBaseSchema.extend({
  eventType: z.literal(ManagementEventType.StartEmbedding),
})

export type StartEmbeddingEvent = z.infer<typeof StartEmbeddingEventSchema>

export const StopEmbeddingEventSchema = ManagementEventBaseSchema.extend({
  eventType: z.literal(ManagementEventType.StopEmbedding),
})

export type StopEmbeddingEvent = z.infer<typeof StopEmbeddingEventSchema>

export const StartContentExtractionEventSchema = ManagementEventBaseSchema.extend({
  eventType: z.literal(ManagementEventType.StartContentExtraction),
})

export type StartContentExtractionEvent = z.infer<typeof StartContentExtractionEventSchema>

export const StopContentExtractionEventSchema = ManagementEventBaseSchema.extend({
  eventType: z.literal(ManagementEventType.StopContentExtraction),
})

export type StopContentExtractionEvent = z.infer<typeof StopContentExtractionEventSchema>

export const ManagementEventSchema = z.discriminatedUnion('eventType', [
  StartEmbeddingEventSchema,
  StopEmbeddingEventSchema,
  StartContentExtractionEventSchema,
  StopContentExtractionEventSchema,
])
