import { watchWorkspaceRegistryEntry } from '@george-ai/event-service-client'

import { WORKER_ID, WORKSPACE_IDS } from './constants'
import { subscribeManagementEvents, unsubscribeManagementEvents } from './subscriptions'
import { cleanupWorkspaceCache, ensureWorkspaceInCache, removeWorkspaceFromCache } from './workspaces'

async function main() {
  console.log(`Starting AI Service Worker (ID: ${WORKER_ID})`)
  const workspaceRegistryWatcherCleanup = await watchWorkspaceRegistryEntry(
    async ({ workspaceId, operation, value }) => {
      if (operation === 'delete') {
        console.log(`Workspace registry entry deleted for workspaceId ${workspaceId}`)
        removeWorkspaceFromCache(workspaceId)
        unsubscribeManagementEvents(workspaceId)
      } else if (operation === 'create' || operation === 'update') {
        console.log(`Workspace registry entry arrived for workspace ${workspaceId}`)
        if (!value) {
          console.warn(
            `Received ${operation} operation for workspace registry entry for workspaceId ${workspaceId} but value is null`,
          )
        } else {
          console.log(`Caching workspace registry entry for workspaceId ${workspaceId}`)
          await ensureWorkspaceInCache(value)
          await subscribeManagementEvents(workspaceId)
        }
      } else {
        console.log(`Unknown operation ${operation} for workspace registry entry for workspaceId ${workspaceId}`)
      }
    },
  )

  console.log(`Target workspaces: ${WORKSPACE_IDS}`)

  console.log(`Worker started, listening for workspace lifecycle events...`)

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...')
    await workspaceRegistryWatcherCleanup()
    await cleanupWorkspaceCache()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...')
    await workspaceRegistryWatcherCleanup()
    await cleanupWorkspaceCache()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Fatal error in AI Service Worker:', error)
  process.exit(1)
})
