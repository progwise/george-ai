import { heartbeatWorkerSlot, watchRegistry } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap, stopProcessing } from '../processing'
import { logger } from './common'
import { handleHostRemoval } from './handle-host-removal'
import { handleHostUpdate } from './handle-host-update'
import { handleWorkspaceRemoval } from './handle-workspace-removal'
import { handleWorkspaceUpdate } from './handle-workspace-update'

export async function startRegistryManager() {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Registry Manager started')

  let failedHeartbeatCount = 0
  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'registryManager' })
      failedHeartbeatCount = 0
    } catch (error) {
      failedHeartbeatCount++
      logger.error('Error updating worker heartbeat:', {
        WORKER_ID,
        workerType: 'registryManager',
        error,
        failedHeartbeatCount,
      })
      if (failedHeartbeatCount >= 3) {
        await stopProcessing('registryManager')
      }
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeWorkspaceConfigs = await watchRegistry(
    async ({ entryType, entry, operation, workspaceId, hostId }) => {
      logger.debug('Registry change detected', { entryType, entry, operation, workspaceId, hostId })
      processingMap.updateStats('registryManager')
      switch (entryType) {
        case 'inference-host':
          if (operation === 'delete') {
            return await handleHostRemoval({ workspaceId, hostId })
          } else if (operation === 'update' && hostId) {
            return await handleHostUpdate(entry)
          } else {
            logger.warn('Can not handle host config change', { entry, operation, hostId })
          }
          break
        case 'workspace':
          if (operation === 'update') {
            return await handleWorkspaceUpdate(workspaceId, entry)
          } else if (operation === 'delete') {
            return await handleWorkspaceRemoval(workspaceId)
          }
          break
        default:
          logger.warn('Unknown workspace config operation', { entry, operation, workspaceId })
      }
    },
  )

  cleanupFunctions.push(async () => {
    await unsubscribeWorkspaceConfigs()
  })

  return async () => {
    await Promise.all(
      cleanupFunctions.map((fn) =>
        fn().catch((error) => logger.error('Error during cleanup in Registry Manager:', { WORKER_ID, error })),
      ),
    )
  }
}
