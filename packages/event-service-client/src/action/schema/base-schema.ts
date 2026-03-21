import z from 'zod'

import { AnyActionSchema } from './action'
import { WorkspaceVerbSchema } from './verb'

export const WorkspaceEventBaseSchema = z.object({
  version: z.literal(1),
  workspaceId: z.string().min(3),
  verb: WorkspaceVerbSchema,
  action: AnyActionSchema,
  timestamp: z.coerce.date(),
})

export const WorkspaceRequestBaseSchema = WorkspaceEventBaseSchema.extend({
  verb: z.literal('request'),
})

export const WorkspaceResponseBaseSchema = WorkspaceEventBaseSchema.extend({
  verb: z.literal('response'),
  success: z.boolean(),
})

export const WorkspaceStatusBaseSchema = WorkspaceEventBaseSchema.extend({
  verb: z.literal('status'),
})
