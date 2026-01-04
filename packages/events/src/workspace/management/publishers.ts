import { eventClient } from '../../shared'
import { ensureWorkspaceStream } from '../workspace-setup'
import type { WorkspaceManagementEvent } from './schemas'

export const publishManagementEvent = async (event: Omit<WorkspaceManagementEvent, 'eventName' | 'timestamp'>) => {
  await ensureWorkspaceStream(event.workspaceId)
  const subject = `workspace.${event.workspaceId}.workspace-management`
  const payload = new TextEncoder().encode(
    JSON.stringify({ ...event, eventName: 'workspace-management', timestamp: new Date().toISOString() }),
  )
  await eventClient.publish({
    subject,
    payload,
  })
}
