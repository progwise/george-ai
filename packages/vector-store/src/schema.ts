import z from 'zod'

import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-commons'

export const VectorStoreChunkIdentifierSchema = z.object({
  libraryId: z.string().optional(),
  fileId: z.string().optional(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  chunk: z.number(),
  fragment: z.number().nullable().optional(),
})

export type VectorStoreChunkIdentifier = z.infer<typeof VectorStoreChunkIdentifierSchema>

export const VectorStoreChunkSchema = VectorStoreChunkIdentifierSchema.extend({
  filename: z.string().optional(),
  filePath: z.string().optional(),
  content: z.string().optional(),
  fileHash: z.string().optional(),
  fileSizeBytes: z.number().optional(),
  fileMimeType: z.string().optional(),
  fileCreatedAt: z.string().optional(), // ISO date string
  fileUpdatedAt: z.string().optional(), // ISO date string
  fileUploadedAt: z.string().optional(), // ISO date string
  creationAuthor: z.string().optional(),
  updateAuthor: z.string().optional(),
})

export type VectorStoreChunk = z.infer<typeof VectorStoreChunkSchema>

// Record with model name as key and vector as value
export type VectorModelMap = Record<string, number[]>

export interface VectorStoreChunksSelector {
  libraryId?: string
  fileId?: string
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  chunk?: number
  modelName?: string | null
  contentGlobPattern?: string
  filenameGlobPattern?: string
  filePathGlobPattern?: string
  fileHash?: string
  fileMimeTypeGlobPattern?: string
  fileCreatedAt?: { earliest: string; latest?: string } // ISO date string
  fileUpdatedAt?: { earliest: string; latest?: string } // ISO date string
  fileUploadedAt?: { earliest: string; latest?: string } // ISO date string
  creationAuthorGlobPattern?: string
  updateAuthorGlobPattern?: string
}
