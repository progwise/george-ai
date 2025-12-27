import z from 'zod'

export const FileEmbeddingOptionsSchema = z.object({
  embeddingModelName: z.string(),
  embeddingModelProvider: z.string(),
})

export type FileEmbeddingOptions = z.infer<typeof FileEmbeddingOptionsSchema>

export const FileEmbeddingResultSchema = z.object({
  chunkCount: z.number(),
  chunkSize: z.number(),
  processingTimeMs: z.number(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timeout: z.boolean(),
  partialResult: z.boolean(),
  success: z.boolean(),
})

export type FileEmbeddingResult = z.infer<typeof FileEmbeddingResultSchema>
