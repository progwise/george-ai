import z from 'zod'

import { EXTRACTION_METHODS } from '@george-ai/app-commons'

import { BaseManifestSchema } from './base-manifest-schema'

export const DocumentManifestSchema = BaseManifestSchema.extend({
  type: z.literal('document'),
  libraryId: z.string().min(3),
  documentId: z.string().min(3),
  name: z.string().min(3),
  mimeType: z.string(),
  sourceHash: z
    .string()
    .nullable()
    .optional()
    .describe('Hash to identify the source and decide if extractions are outdated'),

  origin: z
    .object({
      uri: z
        .string()
        .optional()
        .describe(
          'Where the file is from, e.g. original URL for crawler files, can be used for auditing and debugging',
        ),
      hash: z.string().optional(), // e.g. original file hash from crawler, can be used to detect changes in the source file for re-extraction
      creationDate: z.string().datetime().optional(), // when the file was created at the source, can be used to detect changes in the source file for re-extraction
      lastModifiedDate: z.string().datetime().optional(), // when the file was last modified at the source, can be used to detect changes in the source file for re-extraction
      author: z.string().optional(), // who added the file, can be used for auditing and debugging
    })
    .describe('Information about the origin of the file, can be used for auditing and debugging'),

  extractions: z.array(
    z.object({
      extractionMethod: z.enum(EXTRACTION_METHODS),
      sourceHash: z.string().describe('Hash to identify the source and decide if extractions are outdated'),
      created: z.string().datetime(), // ISO date string
      updated: z.string().datetime().optional(), // ISO date string
    }),
  ),
})
