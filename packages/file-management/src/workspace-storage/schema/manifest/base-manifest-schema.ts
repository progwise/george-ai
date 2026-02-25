import { z } from 'zod'

import { AttachmentSchema } from './attachment-schema'
import { DateTimeSchema } from './common'
import { StorageStatsSchema } from './storage-stats-schema'

export const MANIFEST_TYPES = ['workspace', 'library', 'document', 'extraction', 'fragment'] as const
export type ManifestType = (typeof MANIFEST_TYPES)[number]

export const BaseManifestSchema = z.object({
  version: z.literal(1).describe('Manifest schema version, used for future migrations'),
  type: z.enum(MANIFEST_TYPES).describe('The type of the entity this manifest represents'),
  workspaceId: z.string().min(3), // The ID of this workspace
  created: DateTimeSchema,
  creator: z.string().optional().describe('Who created the entity, can be used for auditing and debugging'),
  updated: DateTimeSchema.optional(),
  attachments: z.array(AttachmentSchema),
  storageStats: StorageStatsSchema,
})
