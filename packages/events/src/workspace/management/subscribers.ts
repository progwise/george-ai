import type { EventClient } from '@george-ai/event-service-client'

import { ensureWorkspaceStream } from '../workspace-setup'
import { WorkspaceManagementEventSchema } from './schemas'
import type { WorkspaceManagementEvent } from './schemas'

export const subscribeManagementEvents = async (
  client: EventClient,
  {
    subscriptionName,
    workspaceId,
    handler,
  }: {
    subscriptionName: string
    workspaceId: string
    handler: (event: WorkspaceManagementEvent) => Promise<void>
  },
): Promise<() => Promise<void>> => {
  const streamName = await ensureWorkspaceStream(client, workspaceId)
  const cleanup = await client.subscribe({
    subscriptionName,
    streamName,
    subjectFilter: `workspace.${workspaceId}.workspace-management`,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = WorkspaceManagementEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling workspace management event:', error)
        throw error
      }
    },
  })

  return cleanup
}
