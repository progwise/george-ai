import { eventClient } from '../client'
import { UsageTrackingEvent } from './schema'

const getPublishSubjectForUsageTrackingEvent = (event: UsageTrackingEvent) => {
  const subject = `usage-tracking.workspace.${event.workspaceId}`
  if (event.libraryId && event.fileId) {
    return `${subject}.library.${event.libraryId}.file.${event.fileId}`
  } else if (event.libraryId) {
    return `${subject}.library.${event.libraryId}`
  } else if (event.listId && event.fieldId) {
    return `${subject}.list.${event.listId}.field.${event.fieldId}`
  } else if (event.listId) {
    return `${subject}.list.${event.listId}`
  } else {
    return subject
  }
}

export async function publishManagementEvent(event: UsageTrackingEvent, timeoutMs?: number) {
  const subject = getPublishSubjectForUsageTrackingEvent(event)
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await eventClient.publish({
    subject,
    payload,
    timeoutMs: timeoutMs || 30000,
  })
}
