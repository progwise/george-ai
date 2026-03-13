import z from 'zod'

import { WorkspaceRequestBaseSchema, WorkspaceStatusBaseSchema } from '../base-schema'

export const MigrateFileRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('migrateFile'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  fileId: z.string().min(3),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  originUri: z.string().min(1).optional(),
  crawledByCrawlerId: z.string().min(1).optional(),
  docPath: z.string().min(1).optional(),
  originFileHash: z.string().min(1).optional(),
  originModificationDate: z.string().min(1).optional(),
  createdAt: z.string().min(1),
  uploadedAt: z.string().min(1).optional(),
  hash: z.string().min(1).optional(),
})

export type MigrateFileRequest = z.infer<typeof MigrateFileRequestSchema>

export const MigrateFileStatusSchema = WorkspaceStatusBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('migrateFile'),
  workspaceId: z.string().min(3),
  libraryId: z.string().min(3),
  fileId: z.string().min(3),
  status: z.enum(['pending', 'started', 'progress', 'finished', 'failure']),
  message: z.string().optional(),
})

export type MigrateFileStatus = z.infer<typeof MigrateFileStatusSchema>
