import z from 'zod'

export const ExtractionStatus = z.enum(['pending', 'processing', 'completed', 'failed'])

export const ExtractionMetadataSchema = z.object({
  version: z.literal(1),
  methodId: z.string(), // e.g. "gpt4o-v1" or "tesseract-ocr"

  // CRITICAL: This allows us to check if the extraction is "stale"
  // by comparing it to the currentSourceHash in the File Manifest
  sourceHashAtExecution: z.string(),

  status: ExtractionStatus,
  executedAt: z.string().datetime(),

  // Store the "recipe" used
  config: z.record(z.any()).optional(),

  // For big files: pointers to shards
  output: z.object({
    mainFile: z.string().default('output.md'),
    isSharded: z.boolean().default(false),
    shardCount: z.number().int().optional(),
    totalRows: z.number().int().optional(), // Useful for CSVs
  }),

  error: z.string().optional(), // Error message if status is 'failed'
  sizeBytes: z.number().int().nonnegative(), // Total size of output.md + shards/
})

export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>
