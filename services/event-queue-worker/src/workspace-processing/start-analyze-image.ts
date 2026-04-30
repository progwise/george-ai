import { subscribe } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { analyzeImage } from './analyze-image'
import { logger } from './common'
import { handleStatus } from './handle-status'

export async function startAnalyzeImage(): Promise<() => Promise<void>> {
  logger.info('Starting image analysis subscription', { WORKER_ID })
  const unsubscribeAnalysis = await subscribe({
    action: 'analyzeImage',
    handler: async ({ event }) => {
      processingMap.updateStats('workspaceProcessing')
      logger.debug('Received image analysis event', {
        WORKER_ID,
        workerType: 'workspaceProcessing',
        event,
      })
      switch (event.verb) {
        case 'status':
          await handleStatus(event)
          return
        case 'request':
          await analyzeImage(event)
          break
        default:
          throw new Error(`Handling of event verb not implemented for image analysis`)
      }
    },
  })

  return unsubscribeAnalysis
}
