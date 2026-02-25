import z from 'zod'

import { WORKER_TYPES } from '@george-ai/app-commons'

export const WorkerEntrySchema = z.object({
  version: z.literal(1),
  workerId: z.string(),
  workerType: z.enum(WORKER_TYPES),
  lastHeartbeat: z.string(), // ISO date string
})

export type WorkerEntry = z.infer<typeof WorkerEntrySchema>
