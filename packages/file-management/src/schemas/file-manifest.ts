import z from 'zod'

import { StorageUsageSchema } from './storage-usage-schema'

export const FileManifestSchema = z.object({
  version: z.literal(1),
  id: z.string().uuid(),
  fileName: z.string(), // e.g. "report.pdf"
  mimeType: z.string(),
  sourceHash: z.string(),

  // Timestamps in ISO format
  createdAt: z.string(),

  extractions: z.array(
    z.object({
      methodId: z.string(),
      extractionHash: z.string(),
      extractionDate: z.string(), // ISO date string
    }),
  ),

  usage: StorageUsageSchema,
})

export type FileManifest = z.infer<typeof FileManifestSchema>
