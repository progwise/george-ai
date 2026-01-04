import z from 'zod'

import { StorageStatsSchema } from './storage-stats-schema'

export const FileManifestSchema = z.object({
  version: z.literal(1),
  id: z.string().uuid(),
  originalName: z.string(), // e.g. "report.pdf"
  mimeType: z.string(),

  // The definitive hash of the 'source' file currently in the folder
  currentSourceHash: z.string(),

  originalUpdatedAt: z.string().datetime(),
  usage: StorageStatsSchema.extend({
    sourceBytes: z.number().int().nonnegative(),
  }),
})

export type FileManifest = z.infer<typeof FileManifestSchema>
