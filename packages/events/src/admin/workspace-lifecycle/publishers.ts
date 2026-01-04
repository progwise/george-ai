import type { EventClient } from '@george-ai/event-service-client'

import { ensureAdminStream } from '../admin-setup'
import type {
  WorkspaceCreatedEvent,
  WorkspaceDeletedEvent,
  WorkspaceStartupEvent,
  WorkspaceTeardownEvent,
} from './schemas'

export const publishWorkspaceCreated = async (client: EventClient, event: WorkspaceCreatedEvent) => {
  await ensureAdminStream(client)
  const subject = 'admin.workspace-created'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await client.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceDeleted = async (client: EventClient, event: WorkspaceDeletedEvent) => {
  await ensureAdminStream(client)
  const subject = 'admin.workspace-deleted'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await client.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceStartup = async (
  client: EventClient,
  event: Omit<WorkspaceStartupEvent, 'eventName' | 'timestamp'>,
) => {
  await ensureAdminStream(client)
  const subject = 'admin.workspace-started'
  const payload = new TextEncoder().encode(
    JSON.stringify({ ...event, eventName: 'workspace-started', timestamp: new Date().toISOString() }),
  )
  await client.publish({
    subject,
    payload,
  })
}

export const publishWorkspaceTeardown = async (client: EventClient, event: WorkspaceTeardownEvent) => {
  await ensureAdminStream(client)
  const subject = 'admin.workspace-stopped'
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await client.publish({
    subject,
    payload,
  })
}

export const deleteWorkspaceStream = async (client: EventClient, workspaceId: string) => {
  const streamName = `workspace-${workspaceId}`
  await client.deleteStream(streamName)
}
