import z from 'zod'

import { ExtractionMethodSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceStatusBaseSchema } from '../base-schema'

export const DocumentExtractionRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('documentExtraction'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  extractionMethod: ExtractionMethodSchema,
})

export type DocumentExtractionRequest = z.infer<typeof DocumentExtractionRequestSchema>

export const DocumentExtractionStatusSchema = WorkspaceStatusBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('documentExtraction'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  extractionMethod: ExtractionMethodSchema,
  status: z.enum(['pending', 'started', 'progress', 'finished', 'failure']),
  message: z.string().optional(),
})

export type DocumentExtractionStatus = z.infer<typeof DocumentExtractionStatusSchema>
