import z from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-commons'

import { StorageUsageSchema } from './storage-usage-schema'

export const FileManifestSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  fileName: z.string(), // e.g. "report.pdf"
  mimeType: z.string(),
  originalContentHash: z.string().nullable(),
  originalUpdatedAt: z.string(),
  sourceHash: z.string(),

  // Timestamps in ISO format
  createdAt: z.string(),

  extractions: z.array(
    z.object({
      extractionMethod: z.enum(EXTRACTION_METHODS),
      extractionHash: z.string(),
      extractionDate: z.string(), // ISO date string
    }),
  ),

  usage: StorageUsageSchema,
})

export type FileManifest = z.infer<typeof FileManifestSchema>
