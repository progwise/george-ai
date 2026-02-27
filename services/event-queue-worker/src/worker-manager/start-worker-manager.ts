import { registerWorker, updateWorkerHeartbeat, watchWorkerEntries } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { ensureProcessingStart, ensureProcessingStop } from '../ensure-processing'
import sub from '../subscription-map'
import { logger } from './common'

export async function startWorkerManager(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Starting worker manager', { WORKER_ID })
  const heartbeatInterval = setInterval(async () => {
    try {
      await updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'WORKER_MANAGER' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'WORKER_MANAGER', error })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeWorkerEntries = await watchWorkerEntries({
    handler: async ({ workerId, operation, workerType }) => {
      logger.debug('Worker registry event received', { workerId, operation, workerType, WORKER_ID })
      sub.updateStats('WORKER_MANAGER')

      if (workerId === WORKER_ID && operation === 'delete') {
        logger.warn('Worker entry for this worker was deleted from registry, stop processing for deleted type.', {
          WORKER_ID,
          workerType,
        })
        await ensureProcessingStop(workerType)
      }

      if (workerId === WORKER_ID && operation === 'update') {
        logger.debug('This worker has been registered in the registry. Start necessary processes.', {
          WORKER_ID,
          workerType,
        })
        await ensureProcessingStart(workerType)
      }

      if (operation === 'delete') {
        logger.info('Foreign worker entry deleted - trying to register', { workerId, WORKER_ID, workerType })
        try {
          await registerWorker({ workerId: WORKER_ID, workerType })
        } catch (error) {
          logger.warn('Registration failed:', { error, workerId, WORKER_ID, workerType })
        }
      }
    },
  })
  cleanupFunctions.push(unsubscribeWorkerEntries)

  const cleanup = async () => {
    for (const fn of cleanupFunctions) {
      try {
        await fn()
      } catch (error) {
        logger.error('Error during cleanup in worker manager', { error, WORKER_ID })
      }
    }
  }
  logger.info('Worker manager started successfully', { WORKER_ID })
  return cleanup
}
