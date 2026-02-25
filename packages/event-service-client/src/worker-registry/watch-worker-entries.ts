import { WorkerType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKeyFilter, getWorkerIdFromKey, getWorkerTypeFromKey, logger } from './common'
import { WorkerEntry, WorkerEntrySchema } from './schema'

export async function watchWorkerEntries(parameters: {
  workerType?: WorkerType
  handler: (params: {
    workerType: WorkerType
    workerId: string
    operation: 'update' | 'delete'
    value: WorkerEntry | null
  }) => Promise<void>
}): Promise<() => Promise<void>> {
  const { workerType, handler } = parameters
  const cleanup = await eventClient.watchBucket({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: getKeyFilter({ workerType }),
    handler: async (entry) => {
      const workerType = getWorkerTypeFromKey(entry.key)
      const workerId = getWorkerIdFromKey(entry.key)
      switch (entry.operation) {
        case 'update': {
          const rawText = entry.value ? new TextDecoder().decode(entry.value) : null
          if (!rawText || rawText.length < 2) {
            logger.error('Worker registry entry has no value for update operation', {
              entry,
              workerId,
              workerType,
            })
            throw new Error('Worker registry entry has no value for update operation')
          }
          const json = JSON.parse(rawText)
          const data = WorkerEntrySchema.parse(json)
          return await handler({
            workerId,
            workerType: data.workerType,
            operation: entry.operation,
            value: data,
          })
        }
        case 'delete':
          await handler({ workerId, workerType, operation: 'delete', value: null })
          return
      }
    },
  })
  return cleanup
}
