import { heartbeatWorkerSlot, signupWorker, watchWorkerSlots } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap, startProcessing, stopProcessing } from '../processing'
import { logger } from './common'

export async function startWorkerSlotManager(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Starting worker manager', { WORKER_ID })

  let failedHeartbeatCount = 0
  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'workerSlotManager' })
      failedHeartbeatCount = 0
    } catch (error) {
      failedHeartbeatCount++
      logger.error('Error updating worker heartbeat:', {
        WORKER_ID,
        role: 'workerSlotManager',
        error,
        failedHeartbeatCount,
      })
      if (failedHeartbeatCount >= 3) {
        await stopProcessing('workerSlotManager')
      }
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  const unsubscribeWorkerEntries = await watchWorkerSlots({
    handler: async ({ workerId, operation, role, entry, revision }) => {
      logger.debug('Worker slot event received', { WORKER_ID, workerId, operation, role, entry, revision })
      processingMap.updateStats('workerSlotManager')

      if (workerId === WORKER_ID && operation === 'delete') {
        logger.warn('Worker entry for this worker was deleted, stop processing for deleted type.', {
          WORKER_ID,
          role,
          entry,
          revision,
        })
        await stopProcessing(role)
      }

      if (workerId === WORKER_ID && operation === 'update') {
        logger.debug('This worker has been registered or updated. Start necessary processes.', {
          WORKER_ID,
          role,
          entry,
          revision,
        })
        await startProcessing(role)
      }

      if (workerId !== WORKER_ID && operation === 'delete') {
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
