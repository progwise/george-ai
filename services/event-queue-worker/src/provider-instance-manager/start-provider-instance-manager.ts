import { watchProviderInstances, workerRegistry } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import sub from '../subscription-map'
import { logger } from './common'
import { handleProviderInstanceDeleted } from './handle-provider-instance-deleted'
import { handleProviderInstanceUpdated } from './handle-provider-instance-updated'

export async function startProviderInstanceManager() {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Provider Instance Manager started')

  const heartbeatInterval = setInterval(async () => {
    try {
      await workerRegistry.updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'PROVIDER_INSTANCE_MANAGER' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', {
        WORKER_ID,
        workerType: 'PROVIDER_INSTANCE_MANAGER',
        error,
      })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeProviderInstances = await watchProviderInstances(async (params) => {
    logger.debug('Provider instance change detected', params)
    sub.updateStats('PROVIDER_INSTANCE_MANAGER')
    switch (params.operation) {
      case 'update':
        if (!params.value) {
          logger.warn('Received update operation for provider instance with null value, skipping', {
            workspaceId: params.workspaceId,
          })
          return
        }
        await handleProviderInstanceUpdated(params.value)
        break
      case 'delete':
        await handleProviderInstanceDeleted(params)
        break
      default:
        logger.warn('Unknown provider instance operation', { operation: params.operation })
    }
  })

  cleanupFunctions.push(async () => {
    await unsubscribeProviderInstances()
  })

  return async () => {
    await Promise.all(
      cleanupFunctions.map((fn) =>
        fn().catch((error) => logger.error('Error during cleanup in Provider Instance Manager:', { WORKER_ID, error })),
      ),
    )
  }
}
