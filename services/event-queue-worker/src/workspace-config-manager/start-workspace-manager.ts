import { heartbeatWorkerSlot, watchRegistry } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { logger } from './common'
import { handleWorkspaceConfigDeleted } from './handle-workspace-config-deleted'
import { handleWorkspaceConfigUpdated } from './handle-workspace-config-updated'

export async function startWorkspaceConfigManager() {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Workspace Manager started')

  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'workspaceConfigManager' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'workspaceConfigManager', error })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeWorkspaceConfigs = await watchRegistry('workspace', async ({ entry, operation, workspaceId }) => {
    logger.debug('Workspace config change detected', { entry, operation, workspaceId })
    processingMap.updateStats('workspaceConfigManager')
    switch (operation) {
      case 'update':
        if (!entry) {
          logger.warn('Received invalid workspace config, skipping', {
            workspaceId,
            operation,
            entry,
          })
          return
        }
        await handleWorkspaceConfigUpdated(workspaceId, entry)
        break
      case 'delete':
        await handleWorkspaceConfigDeleted(workspaceId)
        break
      default:
        logger.warn('Unknown workspace config operation', { entry, operation, workspaceId })
    }
  })

  cleanupFunctions.push(async () => {
    await unsubscribeWorkspaceConfigs()
  })

  return async () => {
    await Promise.all(
      cleanupFunctions.map((fn) =>
        fn().catch((error) => logger.error('Error during cleanup in Workspace Manager:', { WORKER_ID, error })),
      ),
    )
  }
}
