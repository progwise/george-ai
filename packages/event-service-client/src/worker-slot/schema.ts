import z from 'zod'

import { WorkerActionResultSchema, WorkerRoleSchema } from '@george-ai/app-schema'

export const WorkerSlotEntrySchema = z.object({
  version: z.literal(1).default(1),
  workerId: z.string(),
  role: WorkerRoleSchema,
  signedUp: z.coerce.date().default(new Date()),

  latestActivity: z.coerce.date().optional(),
  latestActivityResult: WorkerActionResultSchema.optional(),

  latestActionStart: z.coerce.date().optional(),
  latestActionEnd: z.coerce.date().optional(),
  latestActionFailure: z.coerce.date().optional(),
  startedActions: z.number().default(0),
  successfulActions: z.number().default(0),
  failedActions: z.number().default(0),

  lastHeartbeat: z.coerce.date().optional(),
})

export type WorkerSlotEntry = z.infer<typeof WorkerSlotEntrySchema>
