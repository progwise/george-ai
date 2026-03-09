import { heartbeatWorkerSlot, signupWorker, watchWorkerSlots } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap, startProcessing, stopProcessing } from '../processing'
import { logger } from './common'

export async function startWorkerSlotManager(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Starting worker manager', { WORKER_ID })
  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'workerSlotManager' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, role: 'workerSlotManager', error })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeWorkerEntries = await watchWorkerSlots({
    handler: async ({ workerId, operation, role, entry }) => {
      logger.debug('Worker registry event received', { WORKER_ID, workerId, operation, role, entry })
      processingMap.updateStats('workerSlotManager')

      if (workerId === WORKER_ID && operation === 'delete') {
        logger.warn('Worker entry for this worker was deleted from registry, stop processing for deleted type.', {
          WORKER_ID,
          role,
          entry,
        })
        await stopProcessing(role)
      }

      if (workerId === WORKER_ID && operation === 'update') {
        logger.debug('This worker has been registered in the registry. Start necessary processes.', {
          WORKER_ID,
          role,
          entry,
        })
        await startProcessing(role)
      }

      if (operation === 'delete') {
        logger.debug('Foreign worker entry deleted - trying to register', { workerId, WORKER_ID, role })
        try {
          await signupWorker({ workerId: WORKER_ID })
        } catch (error) {
          logger.warn('Registration failed:', { error, workerId, WORKER_ID })
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
