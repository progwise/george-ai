import z from 'zod'

// Admin Events - System-wide lifecycle events published to admin stream

export const WorkspaceCreatedEventSchema = z.object({
  eventName: z.literal('workspace-created'),
  workspaceId: z.string(),
  workspaceName: z.string(),
  timestamp: z.string().datetime(),
})
export type WorkspaceCreatedEvent = z.infer<typeof WorkspaceCreatedEventSchema>

export const WorkspaceDeletedEventSchema = z.object({
  eventName: z.literal('workspace-deleted'),
  workspaceId: z.string(),
  timestamp: z.string().datetime(),
})
export type WorkspaceDeletedEvent = z.infer<typeof WorkspaceDeletedEventSchema>

export const AdminEventSchema = z.discriminatedUnion('eventName', [
  WorkspaceCreatedEventSchema,
  WorkspaceDeletedEventSchema,
])
export type AdminEvent = z.infer<typeof AdminEventSchema>
