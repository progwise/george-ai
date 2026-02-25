import z from 'zod'

import { DateTimeSchema } from './common'

export const AttachmentSchema = z.object({
  version: z.literal(1).describe('Attachment manifest schema version, used for future migrations'),
  fileName: z.string(),
  size: z.number().int().nonnegative(),
  mimeType: z.string().optional(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
})
