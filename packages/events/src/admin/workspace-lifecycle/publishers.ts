import { eventClient } from '../../shared'
import { ensureAdminStream } from '../admin-setup'
import type {
  WorkspaceCreatedEvent,
  WorkspaceDeletedEvent,
  WorkspaceStartupEvent,
  WorkspaceTeardownEvent,
} from './schemas'

export const publishWorkspaceCreated = async (event: WorkspaceCreatedEvent) => {
  await ensureAdminStream()
  const subject = 'admin.workspace-created'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceDeleted = async (event: WorkspaceDeletedEvent) => {
  await ensureAdminStream()
  const subject = 'admin.workspace-deleted'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceStartup = async (event: Omit<WorkspaceStartupEvent, 'eventName' | 'timestamp'>) => {
  await ensureAdminStream()
  const subject = 'admin.workspace-started'
  const payload = new TextEncoder().encode(
    JSON.stringify({ ...event, eventName: 'workspace-started', timestamp: new Date().toISOString() }),
  )
  await eventClient.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceTeardown = async (event: WorkspaceTeardownEvent) => {
  await ensureAdminStream()
  const subject = 'admin.workspace-stopped'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
  })
}

export const deleteWorkspaceStream = async (workspaceId: string) => {
  const streamName = `workspace-${workspaceId}`
  await eventClient.deleteStream(streamName)
}
