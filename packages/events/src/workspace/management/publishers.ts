import type { EventClient } from '@george-ai/event-service-client'

import { ensureWorkspaceStream } from '../workspace-setup'
import type { WorkspaceManagementEvent } from './schemas'

export const publishManagementEvent = async (
  client: EventClient,
  event: Omit<WorkspaceManagementEvent, 'eventName' | 'timestamp'>,
) => {
  await ensureWorkspaceStream(client, event.workspaceId)
  const subject = `workspace.${event.workspaceId}.workspace-management`
  const payload = new TextEncoder().encode(
    JSON.stringify({ ...event, eventName: 'workspace-management', timestamp: new Date().toISOString() }),
  )
  await client.publish({
    subject,
    payload,
  })
}
