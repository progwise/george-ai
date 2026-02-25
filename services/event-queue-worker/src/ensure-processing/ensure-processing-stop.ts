import { WorkerType } from '@george-ai/app-commons'

import { WORKER_ID, logger, subscriptions } from '../common'

export async function ensureProcessingStop(workerType: WorkerType) {
  const subscription = subscriptions.get(workerType)
  if (!subscription) {
    logger.info('Processing for worker type not running, skipping stop', { workerType })
    return
  }

  logger.info('Stopping processing for worker type', { workerType, subscription })

  await subscription.cleanupFunction()
  subscriptions.delete(workerType)
  logger.info('Processing stopped for worker type', { workerType })
  if (subscriptions.size === 0) {
    logger.info('No active processing subscriptions remaining - staying tuned', { WORKER_ID })
  } else {
    logger.info('Active processing subscriptions remaining', { activeSubscriptions: Array.from(subscriptions.keys()) })
  }
}
