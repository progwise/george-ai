import z from 'zod'

export const FileConverterResultSchema = z.object({
  markdownContent: z.string(),
  processingTimeMs: z.number(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timeout: z.boolean(),
  partialResult: z.boolean(),
  success: z.boolean(),
})

export type FileConverterResult = z.infer<typeof FileConverterResultSchema>
