import { eventClient } from '../client'
import { WorkspaceEvent, WorkspaceEventType } from './schema'

const getPublishSubjectForWorkspaceEvent = (event: WorkspaceEvent) => {
  switch (event.eventType) {
    case WorkspaceEventType.ExtractionRequest:
      return `workspace.${event.workspaceId}.extraction-request.library.${event.libraryId}.file.${event.fileId}`
    case WorkspaceEventType.EmbeddingRequest:
      return `workspace.${event.workspaceId}.embedding-request.library.${event.libraryId}.file.${event.fileId}`
    case WorkspaceEventType.EmbeddingProgress:
      return `workspace.${event.workspaceId}.embedding-progress.library.${event.libraryId}.file.${event.fileId}`
    case WorkspaceEventType.EmbeddingFinished:
      return `workspace.${event.workspaceId}.embedding-finished.library.${event.libraryId}.file.${event.fileId}`
  }
}

export async function publishWorkspaceEvent(event: WorkspaceEvent, timeoutMs?: number) {
  const subject = getPublishSubjectForWorkspaceEvent(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
