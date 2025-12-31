import type { EventClient } from '@george-ai/event-service-client'

import { type WorkspaceProviderConfigEvent, WorkspaceProviderConfigEventSchema } from './event-types'
import { ensureWorkspaceStream } from './workspace-setup'

export const publishProviderConfigEvent = async (client: EventClient, event: WorkspaceProviderConfigEvent) => {
  await ensureWorkspaceStream(client, event.workspaceId)
  const subject = `workspace.${event.workspaceId}.workspace-provider-config`
  const payload = new TextEncoder().encode(JSON.stringify(event))
  await client.publish({
    subject,
    payload,
  })
}

export const subscribeProviderConfigEvents = async (
  client: EventClient,
  {
    subscriptionName,
    workspaceId,
    handler,
  }: {
    subscriptionName: string
    workspaceId: string
    handler: (event: WorkspaceProviderConfigEvent) => Promise<void>
  },
) => {
  const streamName = await ensureWorkspaceStream(client, workspaceId)
  const cleanup = await client.subscribe({
    subscriptionName,
    streamName,
    subjectFilter: `workspace.${workspaceId}.workspace-provider-config`,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = WorkspaceProviderConfigEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling workspace provider config event:', error)
        throw error
      }
    },
  })

  return cleanup
}
