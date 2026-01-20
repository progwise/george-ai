import z from 'zod'

export const VectorStoreDocumentIdentifierSchema = z.object({
  libraryId: z.string().optional(),
  fileId: z.string().optional(),
  chunkIndex: z.number().optional(),
  shardIndex: z.number().nullable().optional(),
})

export type VectorStoreDocumentIdentifier = z.infer<typeof VectorStoreDocumentIdentifierSchema>

export const VectorStoreDocumentSchema = VectorStoreDocumentIdentifierSchema.extend({
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

export type VectorStoreDocument = z.infer<typeof VectorStoreDocumentSchema>
