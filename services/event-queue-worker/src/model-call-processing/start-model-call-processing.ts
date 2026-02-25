import { modelCalls, workerRegistry } from '@george-ai/event-service-client'

import { WORKER_ID, logger, subscriptions } from '../common'
import { handleAiCall } from './handle-ai-call'

export async function startModelCallProcessing(): Promise<() => Promise<void>> {
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
        const subscription = subscriptions.get('AI_PROVIDER_CALLING')
        if (!subscription) {
          logger.error('No active subscription for AI_PROVIDER_CALLING, skipping processing', {
            workerType: 'AI_PROVIDER_CALLING',
            WORKER_ID,
            providerInstance,
            event,
          })
          return
        }
        subscription.lastProcessedTimestamp = Date.now()
        subscription.processedEvents += 1
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
    logger.error('Error starting AI call processing:', { WORKER_ID, error, workerType: 'AI_PROVIDER_CALLING' })
    try {
      await Promise.all(cleanupFunctions.map((fn) => fn()))
    } catch (cleanupError) {
      logger.error('Error during cleanup after failed startAIIcall Processing:', {
        WORKER_ID,
        cleanupError,
        workerType: 'AI_PROVIDER_CALLING',
      })
    }
    throw error
  }
}
