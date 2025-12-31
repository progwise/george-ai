import { workspace } from '@george-ai/events'

import { eventClient } from './event-client'
import { handleEmbeddingRequest } from './handlers/embed-handler'
import { initProviderConfigSubscription } from './provider-cache'

const WORKSPACE_ID = process.env.WORKSPACE_ID || ''
const WORKER_ID = process.env.WORKER_ID || `ai-service-worker-${Date.now()}`

async function main() {
  console.log(`Starting AI Service Worker (ID: ${WORKER_ID})`)
  console.log(`Target workspace: ${WORKSPACE_ID || 'ALL'}`)

  if (!WORKSPACE_ID) {
    throw new Error('WORKSPACE_ID environment variable is required')
  }

  // Subscribe to provider config events to keep cache updated
  const cleanupProviderConfig = await initProviderConfigSubscription(WORKSPACE_ID)

  // Subscribe to embedding requests for this workspace
  // Using consumer group pattern (shared subscription name) for load balancing across multiple workers
  const cleanupEmbedding = await workspace.subscribeEmbeddingRequests(eventClient, {
    subscriptionName: 'ai-service-worker-pool', // All workers share this name = load balanced
    workspaceId: WORKSPACE_ID,
    handler: async (event) => {
      console.log(
        `Processing embedding request: ${event.processingTaskId} (file: ${event.fileId}, workspace: ${event.workspaceId})`,
      )

      try {
        await handleEmbeddingRequest(event)
        console.log(`Completed embedding request: ${event.processingTaskId}`)
      } catch (error) {
        console.error(`Failed to process embedding request ${event.processingTaskId}:`, error)
        throw error // Reject message so NATS can retry
      }
    },
  })

  console.log(`Worker started, listening for embedding requests...`)

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...')
    await cleanupEmbedding()
    await cleanupProviderConfig()
    await eventClient.disconnect()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...')
    await cleanupEmbedding()
    await cleanupProviderConfig()
    await eventClient.disconnect()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Fatal error in AI Service Worker:', error)
  process.exit(1)
})
