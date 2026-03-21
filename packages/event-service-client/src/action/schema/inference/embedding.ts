import z from 'zod'

import { InferenceDriverSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceResponseBaseSchema } from '../base-schema'

export const EmbeddingRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('chunkEmbedding').default('chunkEmbedding'),
  driver: InferenceDriverSchema,
  modelName: z.string(),
  chunks: z.array(z.string()),
})

export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>

export const EmbeddingResponseSchema = WorkspaceResponseBaseSchema.extend({
  version: z.literal(1).default(1),
  action: z.literal('chunkEmbedding').default('chunkEmbedding'),
  success: z.literal(true),
  embeddings: z.array(
    z.object({
      chunk: z.string(),
      vector: z.array(z.number()),
    }),
  ),
  tokens: z.number().optional(),
})

export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>
