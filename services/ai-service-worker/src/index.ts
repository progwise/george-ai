import { admin } from '@george-ai/events'

import { WORKER_ID, WORKSPACE_IDS } from './constants'
import { cleanupWorkspaceCache, ensureWorkspaceInCache, removeWorkspaceFromCache } from './workspace-cache'

async function main() {
  console.log(`Starting AI Service Worker (ID: ${WORKER_ID})`)
  console.log(`Target workspaces: ${WORKSPACE_IDS}`)

  const cleanupWorkspaceLifecycleEvents = await admin.subscribeWorkspaceLifecycle({
    subscriptionName: `${WORKER_ID}-workspace-lifecycle-events`,
    handler: async (event) => {
      if (event.eventName === 'workspace-started') {
        console.log(`Workspace started: ${event.workspaceId}`)
        ensureWorkspaceInCache(event)
      } else if (event.eventName === 'workspace-stopped') {
        console.log(`Workspace stopped: ${event.workspaceId}`)
        removeWorkspaceFromCache(event)
      } else {
        console.warn(`Unhandled workspace lifecycle event: ${event.eventName} for workspace ${event.workspaceId}`)
      }
    },
  })

  console.log(`Worker started, listening for workspace lifecycle events...`)

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...')
    await cleanupWorkspaceLifecycleEvents()
    await cleanupWorkspaceCache()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...')
    await cleanupWorkspaceLifecycleEvents()
    await cleanupWorkspaceCache()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Fatal error in AI Service Worker:', error)
  process.exit(1)
})
