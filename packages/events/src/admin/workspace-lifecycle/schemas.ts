import z from 'zod'

import { WorkspaceLanguageModelSchema, WorkspaceProviderSchema } from '../../shared/schemas'

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

export const WorkspaceStartupEventSchema = z.object({
  eventName: z.literal('workspace-started'),
  workspaceId: z.string(),
  timestamp: z.string().datetime(),
  providers: z.array(WorkspaceProviderSchema),
  languageModels: z.array(WorkspaceLanguageModelSchema),
})

export type WorkspaceStartupEvent = z.infer<typeof WorkspaceStartupEventSchema>

export const WorkspaceTeardownEventSchema = z.object({
  eventName: z.literal('workspace-stopped'),
  workspaceId: z.string(),
  timestamp: z.string().datetime(),
})

export type WorkspaceTeardownEvent = z.infer<typeof WorkspaceTeardownEventSchema>

export const AdminEventSchema = z.discriminatedUnion('eventName', [
  WorkspaceCreatedEventSchema,
  WorkspaceDeletedEventSchema,
  WorkspaceStartupEventSchema,
  WorkspaceTeardownEventSchema,
])

export type AdminEvent = z.infer<typeof AdminEventSchema>
