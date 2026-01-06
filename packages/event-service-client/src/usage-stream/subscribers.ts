import { eventClient } from '../client'
import { USAGE_STREAM_NAME } from './common'
import { UsageTrackingEvent, UsageTrackingEventSchema } from './schema'

export const subscribeUsageTrackingEvent = async <E extends UsageTrackingEvent>({
  workspaceId,
  handler,
}: {
  workspaceId: string
  handler: (event: E) => Promise<void>
}) => {
  const cleanup = await eventClient.subscribe({
    subjectFilters: [`usage-tracking.workspace.${workspaceId}.*`],
    streamName: USAGE_STREAM_NAME,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = UsageTrackingEventSchema.parse(JSON.parse(decoded)) as E
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding request event:', error)
        throw error
      }
    },
  })

  return cleanup
}
