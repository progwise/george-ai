import { getConfigReport } from '@george-ai/app-commons'
import { signupWorker } from '@george-ai/event-service-client'

import { WORKER_ID, logger, subscriptions } from './common'
import { ensureProcessingStart } from './ensure-processing'

export async function main() {
  logger.info('*** Starting GeorgeAi Event Queue Worker ***')
  logger.info(`\n${getConfigReport()}\n`)

  await ensureProcessingStart('WORKER_REGISTRY')

  const myWorkerEntries = await signupWorker({
    workerId: WORKER_ID,
  })

  if (myWorkerEntries.length === 0) {
    logger.error('Failed to sign up new worker, no entries returned', { WORKER_ID })
  }

  // Graceful shutdown - run cleanup on signal
  const shutdown = async (signal: string) => {
    logger.info('*** Shutting down GeorgeAi Event Queue Worker ***', { signal, WORKER_ID, subscriptions })

    for (const [workerType, item] of subscriptions) {
      try {
        await item.cleanupFunction()
      } catch (error) {
        logger.error('Error during cleanup for subscription', { workerType, error, WORKER_ID, item })
      }
    }
    logger.info('Cleanup complete, exiting.', { WORKER_ID })
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  logger.info('END Main', { WORKER_ID })
  // Function ends, but Node.js keeps running because of:
  // - setInterval (heartbeat)
  // - active subscriptions
}
