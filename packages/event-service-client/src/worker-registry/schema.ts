import z from 'zod'

export const WorkerRegistrySchema = z.object({
  version: z.literal(1),
  workerId: z.string(),
  activeSubscriptions: z.array(z.string()),
  lastHeartbeat: z.string(), // ISO date string
})

export type WorkerRegistryEntry = z.infer<typeof WorkerRegistrySchema>
