import { eventClient } from '../client'
import { ManagementEvent, ManagementEventType } from './schema'

const getPublishSubjectForManagementEvent = (event: ManagementEvent) => {
  switch (event.eventType) {
    case ManagementEventType.StartEmbedding:
      return `management.workspace.${event.workspaceId}.start-embedding`
    case ManagementEventType.StopEmbedding:
      return `management.workspace.${event.workspaceId}.stop-embedding`
    case ManagementEventType.StartContentExtraction:
      return `management.workspace.${event.workspaceId}.start-content-extraction`
    case ManagementEventType.StopContentExtraction:
      return `management.workspace.${event.workspaceId}.stop-content-extraction`
  }
}

export async function publishManagementEvent(event: ManagementEvent, timeoutMs?: number) {
  const subject = getPublishSubjectForManagementEvent(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
