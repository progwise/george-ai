import z from 'zod'

import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-schema'

export const VectorStoreChunkIdentifierSchema = z.object({
  libraryId: z.string(),
  fileId: z.string(),
  extractionMethod: z.enum(EXTRACTION_METHODS),
  chunk: z.number(),
  fragment: z.number().nullable().optional(),
})

export type VectorStoreChunkIdentifier = z.infer<typeof VectorStoreChunkIdentifierSchema>

export const VectorStoreChunkSchema = VectorStoreChunkIdentifierSchema.extend({
  id: z.string(),
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

export const FileChunkSchema = VectorStoreChunkSchema.extend({
  embeddingModelNames: z.array(z.string()).optional(),
})

export type FileChunk = z.infer<typeof FileChunkSchema>

// Record with model name as key and vector as value
export type VectorModelMap = Record<string, number[]>

export interface VectorStoreChunksSelector {
  libraryId?: string | null
  fileId?: string | null
  extractionMethod?: ExtractionMethod | null
  fragment?: number | null
  chunk?: number | null
  modelName?: string | null
  contentGlobPattern?: string | null
  filenameGlobPattern?: string | null
  filePathGlobPattern?: string | null
  fileHash?: string | null
  fileMimeTypeGlobPattern?: string | null
  fileCreatedAt?: { earliest?: Date | null; latest?: Date | null } | null // ISO date string
  fileUpdatedAt?: { earliest?: Date | null; latest?: Date | null } | null // ISO date string
  fileUploadedAt?: { earliest?: Date | null; latest?: Date | null } | null // ISO date string
  creationAuthorGlobPattern?: string | null
  updateAuthorGlobPattern?: string | null
}
