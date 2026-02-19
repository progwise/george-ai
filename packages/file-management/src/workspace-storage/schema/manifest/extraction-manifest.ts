import z from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-commons'

import { BaseManifestSchema } from './base-manifest-schema'

export const ExtractionManifestSchema = BaseManifestSchema.extend({
  type: z.literal('extraction'),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  sourceHash: z.string(),
  extracted: z.string().datetime().optional(),
  fragmentCount: z.number().int().nonnegative().optional(),
})
