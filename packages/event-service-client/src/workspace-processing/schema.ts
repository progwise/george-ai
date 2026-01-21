import z from 'zod'

export const PROCESS_TYPES = ['embedding', 'extraction', 'enrichment'] as const
export type ProcessType = (typeof PROCESS_TYPES)[number]

export const PROCESS_STATUS = ['started', 'finished', 'progressing'] as const
export type ProcessStatus = (typeof PROCESS_STATUS)[number]

export const ProcessBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  processType: z.enum(PROCESS_TYPES),
})

export const StatusBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string(),
  processType: z.enum(PROCESS_TYPES),
  processingTimeMs: z.number(),
  status: z.enum(PROCESS_STATUS),
  message: z.string(),
})

export const EmbeddingRequestSchema = ProcessBaseSchema.extend({
  processType: z.literal('embedding'),
  libraryId: z.string(),
  fileId: z.string(),
  fileFragmentIndex: z.number().nullable().optional(),
  extractionMethod: z.string().nullable().optional(),
})

export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>

export const EmbeddingStatusSchema = StatusBaseSchema.extend({
  processType: z.literal('embedding'),
  libraryId: z.string(),
  fileId: z.string(),
  fileFragmentId: z.string().optional(),
  extractionMethod: z.string(),
  chunkCount: z.number(),
  chunkSize: z.number(),
})

export type EmbeddingStatus = z.infer<typeof EmbeddingStatusSchema>

export const ExtractionRequestSchema = ProcessBaseSchema.extend({
  processType: z.literal('extraction'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.string(),
})

export type ExtractionRequest = z.infer<typeof ExtractionRequestSchema>

export const ExtractionStatusSchema = StatusBaseSchema.extend({
  processType: z.literal('extraction'),
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.string(),
})

export type ExtractionStatus = z.infer<typeof ExtractionStatusSchema>

export const EnrichmentRequestSchema = ProcessBaseSchema.extend({
  processType: z.literal('enrichment'),
  libraryId: z.string(),
  fileId: z.string(),
  enrichmentType: z.string(),
})

export type EnrichmentRequest = z.infer<typeof EnrichmentRequestSchema>

export const EnrichmentStatusSchema = StatusBaseSchema.extend({
  processType: z.literal('enrichment'),
  libraryId: z.string(),
  fileId: z.string(),
  enrichmentType: z.string(),
})

export type EnrichmentStatus = z.infer<typeof EnrichmentStatusSchema>

export type ProcessEvent = EmbeddingRequest | ExtractionRequest | EnrichmentRequest
export type StatusEvent = EmbeddingStatus | ExtractionStatus | EnrichmentStatus

export const ProcessSchema = z.discriminatedUnion('processType', [
  EmbeddingRequestSchema,
  ExtractionRequestSchema,
  EnrichmentRequestSchema,
])

export const StatusSchema = z.discriminatedUnion('processType', [
  EmbeddingStatusSchema,
  ExtractionStatusSchema,
  EnrichmentStatusSchema,
])
