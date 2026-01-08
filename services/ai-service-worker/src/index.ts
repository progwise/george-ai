import {
  putWorkerRegistryEntry,
  removeWorkspaceFromWorkerEntry,
  updateWorkerHeartbeat,
  watchWorkspaceRegistryEntry,
} from '@george-ai/event-service-client'
import { createLogger } from '@george-ai/web-utils'

import { WORKER_ID, WORKSPACE_IDS } from './constants'
import {
  getSubscribedEmbeddingWorkspaces,
  getSubscribedManagementWorkspaces,
  subscribeManagementEvents,
  unsubscribeEmbeddingEvents,
  unsubscribeManagementEvents,
} from './subscriptions'
import { cleanupWorkspaceCache, ensureWorkspaceInCache, removeWorkspaceFromCache } from './workspaces'

const logger = createLogger('AI Service Worker')

logger.info('AI Service Worker starting', { workerId: WORKER_ID })

async function main() {
  logger.info('Starting AI Service Worker', { workerId: WORKER_ID })

  await putWorkerRegistryEntry({
    workerId: WORKER_ID,
    lastHeartbeat: new Date().toISOString(),
    activeSubscriptions: [],
    version: 1,
  })

  const workspaceInitializing = new Set<string>()

  const workspaceRegistryWatcherCleanup = await watchWorkspaceRegistryEntry(
    async ({ workspaceId, operation, value }) => {
      if (operation === 'delete') {
        logger.info('Workspace registry entry deleted', { workspaceId })
        await removeWorkspaceFromWorkerEntry(WORKER_ID, workspaceId)
        removeWorkspaceFromCache(workspaceId)
        unsubscribeManagementEvents(workspaceId)
      } else if (operation === 'create' || operation === 'update') {
        logger.info('Workspace registry entry arrived', { workspaceId, operation })
        if (!value) {
          logger.warn('Received workspace registry operation but value is null', {
            operation,
            workspaceId,
          })
        } else {
          logger.info('Caching workspace registry entry', {
            workspaceId,
            providerCount: value.providerInstances.length,
            modelCount: value.languageModels?.length || 0,
          })

          if (operation === 'create' || operation === 'update') {
            if (workspaceInitializing.has(workspaceId)) {
              logger.warn('Workspace already initializing, skipping duplicate', { workspaceId })
              return
            }

            workspaceInitializing.add(workspaceId)
            try {
              await ensureWorkspaceInCache(value)
              await subscribeManagementEvents(workspaceId)
            } finally {
              workspaceInitializing.delete(workspaceId)
            }
          }
        }
      } else {
        logger.info('Unknown workspace registry operation', { operation, workspaceId })
      }
    },
  )

  logger.info('Target workspaces configured', { workspaceIds: WORKSPACE_IDS })

  logger.info('Worker started, listening for workspace lifecycle events')

  const heartbeatInterval = setInterval(async () => {
    try {
      await updateWorkerHeartbeat(WORKER_ID)
    } catch (error) {
      logger.error('Error updating worker heartbeat:', error)
    }
  }, 30 * 1000) // Every 30 seconds

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...')
    const embeddingWorkspaces = getSubscribedEmbeddingWorkspaces()
    await Promise.all(embeddingWorkspaces.map((workspaceId) => unsubscribeEmbeddingEvents(workspaceId)))

    // Unsubscribe from all management events
    const managementWorkspaces = getSubscribedManagementWorkspaces()
    await Promise.all(managementWorkspaces.map((workspaceId) => unsubscribeManagementEvents(workspaceId)))
    await workspaceRegistryWatcherCleanup()
    await cleanupWorkspaceCache()
    clearInterval(heartbeatInterval)
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...')
    const embeddingWorkspaces = getSubscribedEmbeddingWorkspaces()
    await Promise.all(embeddingWorkspaces.map((workspaceId) => unsubscribeEmbeddingEvents(workspaceId)))

    // Unsubscribe from all management events
    const managementWorkspaces = getSubscribedManagementWorkspaces()
    await Promise.all(managementWorkspaces.map((workspaceId) => unsubscribeManagementEvents(workspaceId)))
    await workspaceRegistryWatcherCleanup()
    await cleanupWorkspaceCache()
    clearInterval(heartbeatInterval)
    process.exit(0)
  })
}

main().catch((error) => {
  logger.error('Fatal error in AI Service Worker:', error)
  process.exit(1)
})
