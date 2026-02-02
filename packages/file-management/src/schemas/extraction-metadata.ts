import z from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-commons'

export const AttachmentMetadataSchema = z.object({
  filename: z.string(),
  size: z.number().int().nonnegative(),
  mimeType: z.string().optional(),
})

export type AttachmentMetadata = z.infer<typeof AttachmentMetadataSchema>

export const ExtractionMetadataSchema = z.object({
  version: z.literal(1),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  sourceHash: z.string(),
  extractedAt: z.string().datetime(),
  extractionFiles: z.number().int().nonnegative(),
  physicalFiles: z.number().int().nonnegative(),
  extractedBytes: z.number().int().nonnegative(),
  physicalBytes: z.number().int().nonnegative(),
  splitFragmentPattern: z.string().optional(),
  hasFragments: z.boolean().default(false),
  fragmentCount: z.number().int().optional(),
  attachments: z.array(AttachmentMetadataSchema).optional(),
})

export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>
