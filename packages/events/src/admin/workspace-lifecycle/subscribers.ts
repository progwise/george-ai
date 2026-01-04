import type { EventClient } from '@george-ai/event-service-client'

import { ensureAdminStream, getAdminStreamName } from '../admin-setup'
import { AdminEventSchema } from './schemas'
import type { AdminEvent } from './schemas'

export const subscribeWorkspaceLifecycle = async (
  client: EventClient,
  {
    subscriptionName,
    handler,
  }: {
    subscriptionName: string
    handler: (event: AdminEvent) => Promise<void>
  },
) => {
  await ensureAdminStream(client)

  const cleanup = await client.subscribe({
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
