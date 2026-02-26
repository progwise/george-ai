import { respondProviderInstance, updateWorkerHeartbeat } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from '../common'
import sub from '../subscription-map'
import { getProviderInstanceStatusReport } from './get-provider-instance-status-report'

export async function startProviderInstanceResponder() {
  logger.info('Starting provider instance responder', { WORKER_ID })

  const heartbeatInterval = setInterval(async () => {
    try {
      await updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'PROVIDER_INSTANCE_RESPONDER' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'PROVIDER_INSTANCE_RESPONDER', error })
    }
  }, 30 * 1000) // Every 30 seconds

  const cleanup = await respondProviderInstance({
    handler: async ({ event }) => {
      logger.debug('Handling provider instance request event:', { event })
      sub.updateStats('PROVIDER_INSTANCE_RESPONDER')

      switch (event.requestType) {
        case 'statusReport': {
          return await getProviderInstanceStatusReport(event)
        }
        default:
          logger.error('Received provider instance request with unsupported request type:', { event })
          throw new Error(`Provider instance request type not implemented: ${event.requestType}`)
      }
    },
    request: undefined,
  })

  return async () => {
    clearInterval(heartbeatInterval)
    await cleanup()
  }
}
