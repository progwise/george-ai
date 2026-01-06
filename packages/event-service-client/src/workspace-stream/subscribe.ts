import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getSubjectFilterForWorkspaceEvent } from './common'
import { WorkspaceEvent, WorkspaceEventSchema, WorkspaceEventType } from './schema'

// We need different subscriptions for different event types to ensure that
// we can stop/start processing specific event types independently.
export const subscribeWorkspaceEvent = async <E extends WorkspaceEvent>({
  eventTypes,
  workspaceId,
  handler,
}: {
  eventTypes: WorkspaceEventType[]
  workspaceId: string
  handler: (event: E) => Promise<void>
}) => {
  const cleanup = await eventClient.subscribe({
    streamName: WORKSPACE_STREAM_NAME,
    subjectFilters: eventTypes.map((eventType) => getSubjectFilterForWorkspaceEvent(workspaceId, eventType)),
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = WorkspaceEventSchema.parse(JSON.parse(decoded)) as E
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding request event:', error)
        throw error
      }
    },
  })

  return cleanup
}
