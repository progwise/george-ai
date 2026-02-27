import {
  ProcessingRequest,
  ProcessingStatus,
  workerRegistry,
  workspaceProcessing,
} from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import sub from '../subscription-map'
import { handleProcessingEvent } from './action-handlers'
import { logger } from './common'
import { handleStatusEvent } from './status-handlers'

export async function startDocumentProcessing(): Promise<() => Promise<void>> {
  const cleanupFunctions = [] as Array<() => Promise<void>>
  logger.info('Starting document processing', { WORKER_ID })
  const heartbeatInterval = setInterval(async () => {
    try {
      await workerRegistry.updateWorkerHeartbeat({ workerId: WORKER_ID, workerType: 'DOCUMENT_PROCESSING' })
    } catch (error) {
      logger.error('Error updating worker heartbeat:', { WORKER_ID, workerType: 'DOCUMENT_PROCESSING', error })
    }
  }, 30 * 1000) // Every 30 seconds
  cleanupFunctions.push(async () => {
    clearInterval(heartbeatInterval)
  })

  try {
    const unsubscribeProcessEvents = await workspaceProcessing.subscribeEvent({
      handler: async ({ eventType, event }) => {
        sub.updateStats('DOCUMENT_PROCESSING')
        logger.debug('Received workspace event', {
          event,
          WORKER_ID,
          workerType: 'DOCUMENT_PROCESSING',
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

    logger.info('Document processing started successfully', { WORKER_ID, workerType: 'DOCUMENT_PROCESSING' })
    return async () => {
      await Promise.all(
        cleanupFunctions.map((fn) =>
          fn().catch((error) => logger.error('Error during cleanup in document processing:', { WORKER_ID, error })),
        ),
      )
    }
  } catch (error) {
    logger.error('Error starting document processing:', { WORKER_ID, error, workerType: 'DOCUMENT_PROCESSING' })
    try {
      await Promise.all(cleanupFunctions.map((fn) => fn()))
    } catch (cleanupError) {
      logger.error('Error during cleanup after failed startDocumentProcessing:', {
        WORKER_ID,
        cleanupError,
        workerType: 'DOCUMENT_PROCESSING',
      })
    }
    throw error
  }
}
