import { subscribeFieldEnrichment } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { logger } from './common'
import { enrichField } from './enrich-field'
import { handleStatus } from './handle-status'

export async function startEnrichment(): Promise<() => Promise<void>> {
  const ensubscribeEnrichment = await subscribeFieldEnrichment({
    handler: async ({ event }) => {
      processingMap.updateStats('workspaceProcessing')
      logger.debug('Received field enrichment event', {
        WORKER_ID,
        workerType: 'workspaceProcessing',
        event,
      })
      switch (event.verb) {
        case 'status':
          await handleStatus(event)
          return
        case 'request':
          await enrichField(event)
          break
        default:
          throw new Error(`Handling of event verb not implemented for field enrichment`)
      }
    },
  })

  return ensubscribeEnrichment
}
