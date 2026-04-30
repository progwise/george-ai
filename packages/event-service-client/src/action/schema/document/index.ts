import z from 'zod'

import { AnalyzeImageRequestSchema, AnalyzeImageStatusSchema } from '../media'
import { DocumentExtractionRequestSchema, DocumentExtractionStatusSchema } from './extraction'
import { MigrateFileRequestSchema, MigrateFileStatusSchema } from './migrate-file'
import { DocumentVectorizationRequestSchema, DocumentVectorizationStatusSchema } from './vectorization'

export * from './migrate-file'
export * from './vectorization'
export * from './extraction'

export const DocumentExtractionEventSchema = z.discriminatedUnion('verb', [
  DocumentExtractionRequestSchema,
  DocumentExtractionStatusSchema,
])

export type DocumentExtractionEvent = z.infer<typeof DocumentExtractionEventSchema>

export const DocumentVectorizationEventSchema = z.discriminatedUnion('verb', [
  DocumentVectorizationRequestSchema,
  DocumentVectorizationStatusSchema,
])

export type DocumentVectorizationEvent = z.infer<typeof DocumentVectorizationEventSchema>

export const MigrateFileEventSchema = z.discriminatedUnion('verb', [MigrateFileRequestSchema, MigrateFileStatusSchema])

export type MigrateFileEvent = z.infer<typeof MigrateFileEventSchema>

export const AnalyzeImageEventSchema = z.discriminatedUnion('verb', [
  AnalyzeImageRequestSchema,
  AnalyzeImageStatusSchema,
])

export type AnalyzeImageEvent = z.infer<typeof AnalyzeImageEventSchema>
