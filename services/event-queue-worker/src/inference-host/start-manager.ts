import { heartbeatWorkerSlot, watchRegistry } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { logger } from './common'
import { handleInferenceHostRemoval } from './handle-removal'
import { handleInferenceHostUpdate } from './handle-update'

export async function startInferenceHostManager() {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Inference Host Manager started')

  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'inferenceHostManager' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'inferenceHostManager', error })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeInferenceHostConfigs = await watchRegistry(
    'inference-host',
    async ({ entry, operation, workspaceId, hostId }) => {
      logger.debug('Inference Host config change detected', { hostId, entry, operation, workspaceId })
      processingMap.updateStats('inferenceHostManager')

      switch (operation) {
        case 'update':
          if (!entry) {
            logger.warn('Received invalid host config, skipping', {
              workspaceId,
              operation,
              entry,
            })
            return
          }
          await handleInferenceHostUpdate(entry)
          break
        case 'delete':
          await handleInferenceHostRemoval({ workspaceId, hostId })
          break
        default:
          logger.warn('Unknown host config operation', { entry, operation, workspaceId })
      }
    },
  )

  cleanupFunctions.push(async () => {
    await unsubscribeInferenceHostConfigs()
  })

  return async () => {
    await Promise.all(
      cleanupFunctions.map((fn) =>
        fn().catch((error) => logger.error('Error during cleanup in Inference Host Manager:', { WORKER_ID, error })),
      ),
    )
  }
}
