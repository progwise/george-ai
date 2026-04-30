import z from 'zod'

export const EMBEDDING_STATUS = ['Ready', 'ModelNotFound', 'UnknownModelConfig', 'WorkspaceNotFound'] as const
export type EmbeddingStatus = (typeof EMBEDDING_STATUS)[number]
export const EmbeddingStatusSchema = z.enum(EMBEDDING_STATUS)

export const DISTANCE_METRICS = ['Cosine', 'Dot', 'Euclid', 'Manhattan'] as const
export const DistanceMetricSchema = z.enum(DISTANCE_METRICS)
export type DistanceMetric = z.infer<typeof DistanceMetricSchema>
