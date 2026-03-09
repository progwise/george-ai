import z from 'zod'

import { EXTRACTION_METHODS } from './extraction'

export const AttachmentSchema = z.object({
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3).optional(),
  documentId: z.string().min(3).optional(),
  extractionMethod: z.enum(EXTRACTION_METHODS).optional(),
  fileName: z.string().min(3),
})

export type Attachment = z.infer<typeof AttachmentSchema>
