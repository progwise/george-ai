import { WorkerType } from '@george-ai/app-commons'

import { WORKER_ID, logger } from '../common'
import sub from '../subscription-map'

export async function ensureProcessingStop(workerType: WorkerType) {
  const subscription = sub.get(workerType)
  if (!subscription) {
    logger.info('Processing for worker type not running, skipping stop', { workerType })
    return
  }

  logger.info('Stopping processing for worker type', { workerType, subscription })

  await subscription.cleanupFunction()
  sub.remove(workerType)
  const activeSubscriptions = sub.getAll()
  logger.info('Processing stopped for worker type', { workerType })
  if (activeSubscriptions.length === 0) {
    logger.info('No active processing subscriptions remaining - staying tuned', { WORKER_ID })
  } else {
    logger.info('Active processing subscriptions remaining', {
      activeSubscriptions,
    })
  }
}
