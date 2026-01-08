import z from 'zod'

export const PROCESSING_TYPES = ['EMBEDDING', 'CONTENT_EXTRACTION'] as const
export type ProcessingType = (typeof PROCESSING_TYPES)[number]

export const WorkerWorspaceSubscriptionSchema = z.object({
  workspaceId: z.string(),
  processingType: z.enum(PROCESSING_TYPES), // Extend as needed
  subscribedAt: z.string(), // ISO date string
})

export type WorkerWorkspaceSubscription = z.infer<typeof WorkerWorspaceSubscriptionSchema>

export const WorkerRegistrySchema = z.object({
  version: z.literal(1),
  workerId: z.string(),
  activeSubscriptions: z.array(WorkerWorspaceSubscriptionSchema),
  lastHeartbeat: z.string(), // ISO date string
})

export type WorkerRegistryEntry = z.infer<typeof WorkerRegistrySchema>
