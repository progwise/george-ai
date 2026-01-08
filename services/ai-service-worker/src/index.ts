import { watchWorkspaceRegistryEntry } from '@george-ai/event-service-client'
import { createLogger } from '@george-ai/web-utils'

import { WORKER_ID, WORKSPACE_IDS } from './constants'
import { subscribeManagementEvents, unsubscribeManagementEvents } from './subscriptions'
import { cleanupWorkspaceCache, ensureWorkspaceInCache, removeWorkspaceFromCache } from './workspaces'

const logger = createLogger('AI Service Worker')

async function main() {
  logger.info(`Starting AI Service Worker (ID: ${WORKER_ID})`)
  const workspaceRegistryWatcherCleanup = await watchWorkspaceRegistryEntry(
    async ({ workspaceId, operation, value }) => {
      if (operation === 'delete') {
        removeWorkspaceFromCache(workspaceId)
        unsubscribeManagementEvents(workspaceId)
      } else if (operation === 'create' || operation === 'update') {
        logger.info(`Workspace registry entry arrived for workspace ${workspaceId}`)
        if (!value) {
          logger.warn(
            `Received ${operation} operation for workspace registry entry for workspaceId ${workspaceId} but value is null`,
          )
        } else {
          logger.info(
            `Caching workspace registry entry for workspaceId ${workspaceId}`,
            JSON.stringify(value.providerInstances),
          )
          await ensureWorkspaceInCache(value)
          await subscribeManagementEvents(workspaceId)
        }
      } else {
        logger.info(`Unknown operation ${operation} for workspace registry entry for workspaceId ${workspaceId}`)
      }
    },
  )

  logger.info(`Target workspaces: ${WORKSPACE_IDS}`)

  logger.info(`Worker started, listening for workspace lifecycle events...`)

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...')
    await workspaceRegistryWatcherCleanup()
    await cleanupWorkspaceCache()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...')
    await workspaceRegistryWatcherCleanup()
    await cleanupWorkspaceCache()
    process.exit(0)
  })
}

main().catch((error) => {
  logger.error('Fatal error in AI Service Worker:', error)
  process.exit(1)
})
