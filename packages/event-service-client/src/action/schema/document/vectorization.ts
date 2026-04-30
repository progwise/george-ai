import z from 'zod'

import { ExtractionMethodSchema, InferenceDriverSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceStatusBaseSchema } from '../base-schema'

export const DocumentVectorizationRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('documentVectorization'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  splitMethod: z.enum(['standard']),
  extractionMethod: ExtractionMethodSchema,
  embeddingDriver: InferenceDriverSchema,
  embeddingModel: z.string().min(3),
})

export type DocumentVectorizationRequest = z.infer<typeof DocumentVectorizationRequestSchema>

export const DocumentVectorizationStatusSchema = WorkspaceStatusBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('documentVectorization'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  splitMethod: z.enum(['standard']),
  extractionMethod: ExtractionMethodSchema,

  embeddingDriver: InferenceDriverSchema,
  embeddingModel: z.string().min(3),
  status: z.enum(['pending', 'started', 'progress', 'finished', 'failure']),
  message: z.string().optional(),
})

export type DocumentVectorizationStatus = z.infer<typeof DocumentVectorizationStatusSchema>
