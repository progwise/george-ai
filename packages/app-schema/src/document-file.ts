import z from 'zod'

import { ExtractionMethodSchema } from './extraction'

export const DOCUMENT_FILE_TYPES = [
  'source',
  'extractionMain',
  'extractionPart',
  'attachment',
  'analysis',
  'backup',
  'manifest',
  'unknown',
] as const
export const DocumentFileTypeSchema = z.enum(DOCUMENT_FILE_TYPES)

export type DocumentFileType = z.infer<typeof DocumentFileTypeSchema>

export const DocumentFileSchema = z.object({
  workspaceId: z.string().nonempty(),
  libraryId: z.string().nonempty(),
  documentId: z.string().nonempty(),
  relativePath: z.string().nonempty(),
  extractionMethod: ExtractionMethodSchema.optional(),
  extractionBackupFolderName: z.string().optional(),
  fileType: DocumentFileTypeSchema,
  fileName: z.string().nonempty(),
  size: z.number().int().min(0),
  mimeType: z.string().nonempty().optional(),
  modified: z.coerce.date(),
  fileUri: z.string().nonempty(),
  isDocumentRoot: z.boolean(),
  isAnalysis: z.boolean(),
  isBackup: z.boolean(),
  isExtractionMain: z.boolean(),
  isExtractionPart: z.boolean(),
  isManifest: z.boolean(),
  isDocumentSourceFile: z.boolean(),
  isAttachment: z.boolean(),
})

export type DocumentFile = z.infer<typeof DocumentFileSchema>
