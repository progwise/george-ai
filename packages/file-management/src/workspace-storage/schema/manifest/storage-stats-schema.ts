import z from 'zod'

import { DateTimeSchema } from './common'

export const StorageStatsSchema = z.object({
  extractionBytes: z.number().int().nonnegative().default(0),
  attachmentBytes: z.number().int().nonnegative().default(0),
  physicalBytes: z.number().int().nonnegative().default(0),

  extractionFileCount: z.number().int().nonnegative().default(0),
  attachmentFileCount: z.number().int().nonnegative().default(0),
  physicalFileCount: z.number().int().nonnegative().default(0),

  // Timestamps in ISO format
  lastReconcile: DateTimeSchema.optional(),
  lastUpdate: DateTimeSchema.optional(),
})
