import z from 'zod'

export const StorageUsageSchema = z.object({
  // 'sourceBytes': Size of the original files
  sourceBytes: z.number().int().nonnegative(),

  // extracedBytes: Size of all extraction files (e.g., output.md, shards/)
  extractedBytes: z.number().int().nonnegative(),

  // 'activeExtractedBytes': Size of extraction files that are still linked to the current source hash
  activeExtractedBytes: z.number().int().nonnegative(),

  // 'physicalBytes': Everything in the folder including manifests, metadata, logs
  physicalBytes: z.number().int().nonnegative(),

  // File counting
  sourceFiles: z.number().int().nonnegative(),
  extractions: z.number().int().nonnegative(),
  activeExtractions: z.number().int().nonnegative(),
  extractionFiles: z.number().int().nonnegative(),
  physicalFiles: z.number().int().nonnegative(),

  // Timestamps in ISO format
  lastReconcile: z.string().optional(),
  lastUpdate: z.string().optional(),
})

export type StorageUsage = z.infer<typeof StorageUsageSchema>
