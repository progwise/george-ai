import z from 'zod'

import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-schema'

export const VectorStoreChunkIdentifierSchema = z.object({
  libraryId: z.string(),
  documentId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  chunk: z.number(),
  fragment: z.number().nullable().optional(),
})

export type VectorStoreChunkIdentifier = z.infer<typeof VectorStoreChunkIdentifierSchema>

export const VectorStoreChunkSchema = VectorStoreChunkIdentifierSchema.extend({
  id: z.string(),
  documentName: z.string().optional(),
  documentPath: z.string().optional(),
  content: z.string().optional(),
  documentHash: z.string().optional(),
  documentSizeBytes: z.number().optional(),
  documentMimeType: z.string().optional(),
  documentCreatedAt: z.string().optional(), // ISO date string
  documentUpdatedAt: z.string().optional(), // ISO date string
  documentUploadedAt: z.string().optional(), // ISO date string
  creationAuthor: z.string().optional(),
  updateAuthor: z.string().optional(),
})

export type VectorStoreChunk = z.infer<typeof VectorStoreChunkSchema>

// Record with model name as key and vector as value
export type VectorModelMap = Record<string, number[]>

export interface VectorStoreChunksSelector {
  libraryId?: string | null
  documentId?: string | null
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  chunk?: number | null
  modelName?: string | null
  contentGlobPattern?: string | null
  documentNameGlobPattern?: string | null
  documentPathGlobPattern?: string | null
  documentHash?: string | null
  documentMimeTypeGlobPattern?: string | null
  documentCreatedAt?: { earliest?: Date | null; latest?: Date | null } | null // ISO date string
  documentUpdatedAt?: { earliest?: Date | null; latest?: Date | null } | null // ISO date string
  documentUploadedAt?: { earliest?: Date | null; latest?: Date | null } | null // ISO date string
  creationAuthorGlobPattern?: string | null
  updateAuthorGlobPattern?: string | null
}
