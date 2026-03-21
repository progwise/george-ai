import z from 'zod'

import { ExtractionMethodSchema } from '@george-ai/app-schema'

import { WorkspaceRequestBaseSchema, WorkspaceStatusBaseSchema } from '../base-schema'

export const AnalyzeImageRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('analyzeImage'),
  imageUri: z.string().min(3),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3).optional(),
  documentId: z.string().min(3).optional(),
  extractionMethod: ExtractionMethodSchema.optional(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  context: z.string().optional(),
})

export type AnalyzeImageRequest = z.infer<typeof AnalyzeImageRequestSchema>

export const AnalyzeImageStatusSchema = WorkspaceStatusBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('analyzeImage'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3).optional(),
  documentId: z.string().min(3).optional(),
  extractionMethod: ExtractionMethodSchema.optional(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  status: z.enum(['pending', 'started', 'progress', 'finished', 'failure']),
  message: z.string().optional(),
})

export type AnalyzeImageStatus = z.infer<typeof AnalyzeImageStatusSchema>
