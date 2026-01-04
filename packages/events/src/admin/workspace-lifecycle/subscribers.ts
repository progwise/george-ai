import { eventClient } from '../../shared'
import { ensureAdminStream, getAdminStreamName } from '../admin-setup'
import { AdminEventSchema } from './schemas'
import type { AdminEvent } from './schemas'

export const subscribeWorkspaceLifecycle = async ({
  subscriptionName,
  handler,
}: {
  subscriptionName: string
  handler: (event: AdminEvent) => Promise<void>
}) => {
  await ensureAdminStream()

  const cleanup = await eventClient.subscribe({
    subscriptionName,
    streamName: getAdminStreamName(),
    subjectFilter: 'admin.*',
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = AdminEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling admin event:', error)
        throw error
      }
    },
  })

  return cleanup
}
