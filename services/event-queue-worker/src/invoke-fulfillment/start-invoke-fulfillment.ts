import { fulfillInvokes, heartbeatWorkerSlot } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { getChatResponse } from './chat-response'
import { logger } from './common'
import { getConnectionTestResponse } from './connection-test'
import { getEmbeddingResponse } from './embedding-response'
import { getHealthStatusResponse } from './health-status'
import { getModelDiscoveryResponse } from './model-discovery'

export async function startInvokeFulfillment() {
  logger.info('Starting invoke responder', { WORKER_ID })

  const heartbeatInterval = setInterval(async () => {
    try {
      await heartbeatWorkerSlot({ workerId: WORKER_ID, role: 'requestFulfillment' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, role: 'requestFulfillment', error })
    }
  }, 30 * 1000) // Every 30 seconds

  const cleanup = await fulfillInvokes({
    handler: async ({ workspaceId, action, request }) => {
      logger.debug('Fulfill invoke', { workspaceId, action, request })
      processingMap.updateStats('requestFulfillment')

      switch (request.action) {
        case 'chatCompletion':
          return getChatResponse(request)
        case 'chunkEmbedding':
          return getEmbeddingResponse(request)
        case 'connectionTest':
          return getConnectionTestResponse(request)
        case 'healthStatus':
          return getHealthStatusResponse(request)
        case 'modelDiscovery':
          return getModelDiscoveryResponse(request)
        default:
          throw new Error(`Unsupported fulfillment request: ${action}`)
      }
    },
  })

  return async () => {
    clearInterval(heartbeatInterval)
    await cleanup()
  }
}
