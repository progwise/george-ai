import z from 'zod'

import { WorkspaceRequestBaseSchema, WorkspaceResponseBaseSchema } from './base-schema'

export const WorkspaceStatsRequestSchema = WorkspaceRequestBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('workspaceStats'),
})

export type WorkspaceStatsRequest = z.infer<typeof WorkspaceStatsRequestSchema>

export const WorkspaceStatsResponseSchema = WorkspaceResponseBaseSchema.extend({
  version: z.literal(1),
  action: z.literal('workspaceStats'),
  success: z.literal(true),
  stats: z.record(z.string(), z.number()),
})

export type WorkspaceStatsResponse = z.infer<typeof WorkspaceStatsResponseSchema>
