import z from 'zod'

export const EMBEDDING_STATUS = ['Ready', 'ModelNotFound', 'UnknownModelConfig', 'WorkspaceNotFound'] as const
export type EmbeddingStatus = (typeof EMBEDDING_STATUS)[number]
export const EmbeddingStatusSchema = z.enum(EMBEDDING_STATUS)
