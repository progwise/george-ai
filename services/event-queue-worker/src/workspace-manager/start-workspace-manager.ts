import { watchWorkspaceConfigs, workerRegistry } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import sub from '../subscription-map'
import { logger } from './common'
import { handleWorkspaceConfigDeleted } from './handle-workspace-config-deleted'
import { handleWorkspaceConfigUpdated } from './handle-workspace-config-updated'

export async function startWorkspaceManager() {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Workspace Manager started')

  const heartbeatInterval = setInterval(async () => {
    try {
      await workerRegistry.updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'WORKSPACE_MANAGER' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'WORKSPACE_MANAGER', error })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeWorkspaces = await watchWorkspaceConfigs(async (params) => {
    logger.debug('Workspace config change detected', params)
    sub.updateStats('WORKSPACE_MANAGER')
    switch (params.operation) {
      case 'update':
        if (!params.value) {
          logger.warn('Received update operation for workspace config with null value, skipping', {
            workspaceId: params.workspaceId,
          })
          return
        }
        await handleWorkspaceConfigUpdated(params.workspaceId, params.value)
        break
      case 'delete':
        await handleWorkspaceConfigDeleted(params.workspaceId)
        break
      default:
        logger.warn('Unknown workspace config operation', { operation: params.operation })
    }
  })

  cleanupFunctions.push(async () => {
    await unsubscribeWorkspaces()
  })

  return async () => {
    await Promise.all(
      cleanupFunctions.map((fn) =>
        fn().catch((error) => logger.error('Error during cleanup in Workspace Manager:', { WORKER_ID, error })),
      ),
    )
  }
}
