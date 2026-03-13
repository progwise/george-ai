import { subscribe } from '@george-ai/event-service-client'

import { WORKER_ID } from '../common'
import { processingMap } from '../processing'
import { logger } from './common'
import { handleStatus } from './handle-status'
import { migrateFile } from './migrate-file'

export async function startMigration(): Promise<() => Promise<void>> {
  const unsubscribeMigration = await subscribe({
    action: 'migrateFile',
    handler: async ({ event }) => {
      processingMap.updateStats('workspaceProcessing')
      logger.debug('Received file migration event', {
        WORKER_ID,
        workerType: 'workspaceProcessing',
        event,
      })
      switch (event.verb) {
        case 'status':
          await handleStatus(event)
          return
        case 'request':
          await migrateFile(event)
          break
        default:
          throw new Error(`Handling of event verb not implemented for document vectorization`)
      }
    },
  })

  return unsubscribeMigration
}
