import z from 'zod'

export const WorkspaceManagementEventSchema = z.object({
  eventName: z.literal('workspace-management'),
  workspaceId: z.string(),
  task: z.object({
    verb: z.enum(['start-processing', 'stop-processing']),
    subject: z.enum(['content-extraction', 'embedding', 'enrichment', 'automation']),
    details: z.record(z.any()).optional(),
  }),
  timestamp: z.string().datetime(),
})

export type WorkspaceManagementEvent = z.infer<typeof WorkspaceManagementEventSchema>
