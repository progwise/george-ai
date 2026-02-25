import {
  ProcessingRequest,
  ProcessingStatus,
  workerRegistry,
  workspaceProcessing,
} from '@george-ai/event-service-client'

import { WORKER_ID, logger, subscriptions } from '../common'
import { handleProcessingEvent } from './action-handlers'
import { handleStatusEvent } from './status-handlers'

export async function startWorkspaceProcessing(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  try {
    logger.info('Starting workspace processing', { WORKER_ID })
    const heartbeatInterval = setInterval(async () => {
      try {
        await workerRegistry.updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'WORKSPACE_PROCESSING' })
      } catch (error) {
        logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'WORKSPACE_PROCESSING', error })
      }
    }, 30 * 1000) // Every 30 seconds
    cleanupFunctions.push(async () => {
      clearInterval(heartbeatInterval)
    })
    const unsubscribeProcessEvents = await workspaceProcessing.subscribeEvent({
      handler: async ({ eventType, event }) => {
        const subscription = subscriptions.get('WORKSPACE_PROCESSING')
        if (!subscription) {
          logger.error('No active subscription for WORKSPACE_PROCESSING, skipping processing', {
            workerType: 'WORKSPACE_PROCESSING',
            WORKER_ID,
            eventType,
            event,
          })
          return
        }
        subscription.lastProcessedTimestamp = Date.now()
        subscription.processedEvents += 1
        logger.debug('Received workspace event', {
          event,
          WORKER_ID,
          workerType: 'WORKSPACE_PROCESSING',
          eventType,
        })
        switch (eventType) {
          case 'status':
            await handleStatusEvent(event as ProcessingStatus)
            return
          case 'request':
            await handleProcessingEvent(event as ProcessingRequest)
            break
          default:
            throw new Error(`Unknown event type: ${eventType}`)
        }
      },
    })
    cleanupFunctions.push(async () => {
      await unsubscribeProcessEvents()
    })

    logger.info('Workspace processing started successfully', { WORKER_ID, workerType: 'WORKSPACE_PROCESSING' })
    return async () => {
      await Promise.all(
        cleanupFunctions.map((fn) =>
          fn().catch((error) => logger.error('Error during cleanup in workspace processing:', { WORKER_ID, error })),
        ),
      )
    }
  } catch (error) {
    logger.error('Error starting workspace processing:', { WORKER_ID, error, workerType: 'WORKSPACE_PROCESSING' })
    try {
      await Promise.all(cleanupFunctions.map((fn) => fn()))
    } catch (cleanupError) {
      logger.error('Error during cleanup after failed startWorkspaceProcessing:', {
        WORKER_ID,
        cleanupError,
        workerType: 'WORKSPACE_PROCESSING',
      })
    }
    throw error
  }
}
