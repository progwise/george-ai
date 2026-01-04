import { z } from 'zod'

import { StorageStatsSchema } from './storage-stats-schema'

export const WorkspaceManifestSchema = z.object({
  version: z.literal(1),
  id: z.string().uuid(), // The ID of this workspace
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  settings: z
    .object({
      storageLimitFiles: z.number().int().nonnegative().optional(),
      storageLimitBytes: z.number().optional(),
    })
    .default({}),
  usage: StorageStatsSchema,
})

export type WorkspaceManifest = z.infer<typeof WorkspaceManifestSchema>
