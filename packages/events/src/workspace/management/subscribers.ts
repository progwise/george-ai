import { eventClient } from '../../shared'
import { ensureWorkspaceStream } from '../workspace-setup'
import { WorkspaceManagementEventSchema } from './schemas'
import type { WorkspaceManagementEvent } from './schemas'

export const subscribeManagementEvents = async ({
  subscriptionName,
  workspaceId,
  handler,
}: {
  subscriptionName: string
  workspaceId: string
  handler: (event: WorkspaceManagementEvent) => Promise<void>
}): Promise<() => Promise<void>> => {
  const streamName = await ensureWorkspaceStream(workspaceId)
  const cleanup = await eventClient.subscribe({
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
