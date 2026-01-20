import { z } from 'zod'

import { StorageUsageSchema } from './storage-usage-schema'

export const LibraryManifestSchema = z.object({
  version: z.literal(1),
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  settings: z
    .object({
      storageLimitFiles: z.number().int().nonnegative().optional(),
      storageLimitBytes: z.number().optional(),
    })
    .default({}),
  // Note: No workspaceId here to keep it movable
  usage: StorageUsageSchema,
})

export type LibraryManifest = z.infer<typeof LibraryManifestSchema>
