import { getConfigReport } from '@george-ai/app-commons'
import { signupWorker } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from './common'
import { processingMap, startProcessing } from './processing'

export async function main() {
  logger.info('*** Starting GeorgeAi Event Queue Worker ***')
  logger.info(`\n${getConfigReport()}\n`)

  await startProcessing('workerSlotManager')

  const myWorkerEntries = await signupWorker({
    workerId: WORKER_ID,
  })

  if (myWorkerEntries.length === 0) {
    logger.error('Failed to sign up new worker, no entries returned', { WORKER_ID })
  }

  // Graceful shutdown - run cleanup on signal
  const shutdown = async (signal: string) => {
    const activeSubscriptions = processingMap.getAll()
    logger.info('*** Shutting down GeorgeAi Event Queue Worker ***', { signal, WORKER_ID, activeSubscriptions })

    const cancelResult = await Promise.allSettled(
      activeSubscriptions.map(async (workerType) => {
        const subscription = processingMap.get(workerType)
        if (!subscription) {
          logger.warn('No subscription found for worker type during shutdown', { workerType, WORKER_ID })
          return
        }
        try {
          await subscription.cleanupFunction()
          logger.info('Successfully cleaned up subscription during shutdown', { workerType, WORKER_ID })
        } catch (error) {
          logger.error('Error during cleanup for subscription in shutdown', { workerType, error, WORKER_ID })
        } finally {
          processingMap.remove(workerType)
        }
      }),
    )

    cancelResult.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.warn('Error during cleanup for subscription in shutdown', {
          workerType: activeSubscriptions[index],
          error: result.reason,
          WORKER_ID,
        })
      } else {
        logger.info('Cleanup promise fulfilled for subscription in shutdown', {
          workerType: activeSubscriptions[index],
          WORKER_ID,
        })
      }
    })

    logger.info('Cleanup complete, exiting.', { WORKER_ID })
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  logger.debug('END Main', { WORKER_ID })
  // Function ends, but Node.js keeps running because of:
  // - setInterval (heartbeat)
  // - active subscriptions
}
