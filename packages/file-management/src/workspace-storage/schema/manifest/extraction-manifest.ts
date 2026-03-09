import z from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-schema'

import { BaseManifestSchema } from './base-manifest-schema'
import { DateTimeSchema } from './common'

export const ExtractionManifestSchema = BaseManifestSchema.extend({
  type: z.literal('extraction'),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  sourceHash: z.string(),
  extracted: DateTimeSchema.optional(),
  fragmentCount: z.number().int().nonnegative().optional(),
})
