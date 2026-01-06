import { eventClient } from '../client'
import { MANAGEMENT_STREAM_NAME } from './common'
import { ManagementEvent, ManagementEventSchema, ManagementEventType } from './schema'

// Event type filtering is not helpful for management events because if we use it,
// different event types would not share the same consumer, leading to events that
// are getting processed by multiple workers.
// Therefore, we only filter by workspaceId.
export const subscribeManagementEvent = async <E extends ManagementEvent>({
  workspaceId,
  eventTypes,
  handler,
}: {
  workspaceId: string
  eventTypes: ManagementEventType[]
  handler: (event: E) => Promise<void>
}) => {
  const cleanup = await eventClient.subscribe({
    subjectFilters: eventTypes.map((eventType) => `management.workspace.${workspaceId}.${eventType}`),
    streamName: MANAGEMENT_STREAM_NAME,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = ManagementEventSchema.parse(JSON.parse(decoded)) as E
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding request event:', error)
        throw error
      }
    },
  })

  return cleanup
}
