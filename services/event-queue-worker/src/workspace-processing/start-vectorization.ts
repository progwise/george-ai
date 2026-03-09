import { subscribeDocumentVectorization } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { logger } from './common'
import { handleStatus } from './handle-status'
import { vectorizeDocument } from './vectorize-document'

export async function startVectorization(): Promise<() => Promise<void>> {
  const unsubscribeExtraction = await subscribeDocumentVectorization({
    handler: async ({ event }) => {
      processingMap.updateStats('workspaceProcessing')
      logger.debug('Received document vectorization event', {
        WORKER_ID,
        workerType: 'workspaceProcessing',
        event,
      })
      switch (event.verb) {
        case 'status':
          await handleStatus(event)
          return
        case 'request':
          await vectorizeDocument(event)
          break
        default:
          throw new Error(`Handling of event verb not implemented for document vectorization`)
      }
    },
  })

  return unsubscribeExtraction
}
