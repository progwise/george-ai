import { WorkerRole } from '@george-ai/app-schema'

import { WORKER_ID, logger } from '../common'
import sub from './subscription-map'

export async function stopProcessing(workerRole: WorkerRole) {
  const subscription = sub.get(workerRole)
  if (!subscription) {
    logger.info('Processing for worker type not running, skipping stop', { workerRole })
    return
  }

  logger.info('Stopping processing for worker type', { workerRole, subscription })

  await subscription.cleanupFunction()
  sub.remove(workerRole)
  const activeSubscriptions = sub.getAll()
  logger.info('Processing stopped for worker type', { workerRole })
  if (activeSubscriptions.length === 0) {
    logger.info('No active processing subscriptions remaining - staying tuned', { WORKER_ID })
  } else {
    logger.info('Active processing subscriptions remaining', {
      activeSubscriptions,
    })
  }
}
