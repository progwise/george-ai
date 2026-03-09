import z from 'zod'

import { DocumentExtractionRequestSchema, DocumentExtractionStatusSchema } from './extraction'
import { DocumentVectorizationRequestSchema, DocumentVectorizationStatusSchema } from './vectorization'

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
