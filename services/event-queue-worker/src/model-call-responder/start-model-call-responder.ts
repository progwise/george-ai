import { getHealthyProviderInstance, updateWorkerHeartbeat } from '@george-ai/event-service-client'
import { respondModelCall } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from '../common'
import sub from '../subscription-map'
import { generateChatCompletion } from './generate-chat-completion'
import { generateEmbedding } from './generate-embedding'

export async function startModelCallResponder() {
  logger.info('Starting model call responder', { WORKER_ID })

  const heartbeatInterval = setInterval(async () => {
    try {
      await updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'MODEL_CALL_RESPONDER' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'MODEL_CALL_RESPONDER', error })
    }
  }, 30 * 1000) // Every 30 seconds

  const cleanup = await respondModelCall({
    handler: async ({ event }) => {
      logger.debug('Handling model call event:', { event })
      sub.updateStats('MODEL_CALL_RESPONDER')
      const healthyInstance = await getHealthyProviderInstance({
        workspaceId: event.workspaceId,
        modelProvider: event.provider,
        modelName: event.modelName,
      })
      if (!healthyInstance) {
        throw new Error('No healthy provider instance found for AI call')
      }

      switch (event.modelCallType) {
        case 'generateEmbedding':
          return generateEmbedding(event, healthyInstance)
        case 'generateChatCompletion':
          return generateChatCompletion(event, healthyInstance)
        default:
          throw new Error(`Unsupported model call type: ${event}`)
      }
    },
  })

  return async () => {
    clearInterval(heartbeatInterval)
    await cleanup()
  }
}
