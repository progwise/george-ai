import z from 'zod'

export const WORKER_TYPES = ['AI_HEALTH_MANAGEMENT', 'WORKSPACE_PROCESSING', 'AI_PROVIDER_CALLING'] as const
export type WorkerType = (typeof WORKER_TYPES)[number]

export const WorkerRegistrySchema = z.object({
  version: z.literal(1),
  workerId: z.string(),
  workerType: z.enum(WORKER_TYPES),
  lastHeartbeat: z.string(), // ISO date string
})

export type WorkerRegistryEntry = z.infer<typeof WorkerRegistrySchema>
