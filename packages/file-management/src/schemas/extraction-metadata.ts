import z from 'zod'

export const ExtractionMetadataSchema = z.object({
  version: z.literal(1),
  methodId: z.string(), // e.g. "text-extraction-v1", "tesseract-ocr-v2", "pdf-to-image-to-text-v1"

  // CRITICAL: This allows us to check if the extraction is "stale"
  sourceHash: z.string(),

  extractedAt: z.string().datetime(),
  extractionFiles: z.number().int().nonnegative(),
  physicalFiles: z.number().int().nonnegative(),
  extractedBytes: z.number().int().nonnegative(),
  physicalBytes: z.number().int().nonnegative(),

  status: z.enum(['pending', 'completed', 'failed', 'upgraded']),

  // Store the "recipe" used
  config: z.record(z.any()).optional(),

  // For big files: pointers to shards
  output: z.object({
    mainFile: z.string().default('output.md'),
    hasFragments: z.boolean().default(false),
    fragmentCount: z.number().int().optional(),
  }),

  error: z.string().optional(), // Error message if status is 'failed'
})

export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>
