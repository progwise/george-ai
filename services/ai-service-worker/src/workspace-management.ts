import { workspace } from '@george-ai/events'

import { eventClient } from './event-client'

const workspaceEmbeddingSubscriptionCache = new Map<string, () => Promise<void>>()

export const handleWorkspaceManagementEvents = async (event: workspace.WorkspaceManagementEvent) => {
  console.log(`Processing workspace management event for workspace ${event.workspaceId}...`)
  switch (event.task.subject) {
    case 'embedding':
      if (event.task.verb === 'start-processing') {
        const item = workspaceEmbeddingSubscriptionCache.get(event.workspaceId)
        if (item) {
          console.warn(`Embedding processing already running for workspace ${event.workspaceId}.`)
          return
        }
        console.log(`Starting embedding processing for workspace ${event.workspaceId}...`)
        const cleanup = await workspace.subscribeEmbeddingRequests(eventClient, {
          subscriptionName: `ai-service-worker-embedding-${event.workspaceId}`,
          workspaceId: event.workspaceId,
          handler: async (embeddingEvent) => {
            console.log(`Received embedding request for workspace ${event.workspaceId}: ${embeddingEvent.fileId}`)
            // Handle the embedding request here
          },
        })
        workspaceEmbeddingSubscriptionCache.set(event.workspaceId, cleanup)
      } else if (event.task.verb === 'stop-processing') {
        console.log(`Stopping embedding processing for workspace ${event.workspaceId}...`)
        // Stop embedding processing logic here
        const cleanup = workspaceEmbeddingSubscriptionCache.get(event.workspaceId)
        if (!cleanup) {
          console.warn(`No embedding processing found for workspace ${event.workspaceId} to stop.`)
          return
        }
        await cleanup()
        workspaceEmbeddingSubscriptionCache.delete(event.workspaceId)
      }
      break
    // Handle other subjects like 'content-extraction', 'enrichment', 'automation' similarly
    default:
      console.warn(`Unhandled workspace management event subject: ${event.task.subject}`)
  }
}
