import { modelCalls, workerRegistry } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from '../common'
import { handleAiCall } from './handle-ai-call'

export async function startAICallProcessing(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  try {
    logger.info('starting ai call processing', { WORKER_ID })
    const heartbeatInterval = setInterval(async () => {
      try {
        await workerRegistry.updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'AI_PROVIDER_CALLING' })
      } catch (error) {
        logger.warn('Error updating worker heartbeat. Trying to re-register the worker.', {
          WORKER_ID,
          workerType: 'AI_PROVIDER_CALLING',
          error,
        })
      }
    }, 30 * 1000) // Every 30 seconds
    cleanupFunctions.push(async () => {
      clearInterval(heartbeatInterval)
    })
    const unsubscribeProcessEvents = await modelCalls.subscribeModelCalls({
      handler: async ({ event, providerInstance }) => {
        logger.debug('Received AI call processing event', {
          event,
          WORKER_ID,
          workerType: 'AI_PROVIDER_CALLING',
          providerInstance,
        })
        await handleAiCall(event, providerInstance)
      },
    })
    cleanupFunctions.push(async () => {
      await unsubscribeProcessEvents()
    })

    logger.info('AI call processing started successfully', { WORKER_ID, workerType: 'AI_PROVIDER_CALLING' })
    return async () => {
      await Promise.all(cleanupFunctions.map((fn) => fn()))
    }
  } catch (error) {
    logger.error('Error starting workspace processing:', { WORKER_ID, error, workerType: 'AI_PROVIDER_CALLING' })
    try {
      await Promise.all(cleanupFunctions.map((fn) => fn()))
    } catch (cleanupError) {
      logger.error('Error during cleanup after failed startAICallProcessing:', {
        WORKER_ID,
        cleanupError,
        workerType: 'AI_PROVIDER_CALLING',
      })
    }
    throw error
  }
}
