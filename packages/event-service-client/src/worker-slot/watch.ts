import { WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKeyFilter, logger, parseWorkerSlotKey } from './common'
import { WorkerSlotEntry, WorkerSlotEntrySchema } from './schema'

export async function watchWorkerSlots(parameters: {
  role?: WorkerRole
  handler: (params: {
    role: WorkerRole
    workerId: string
    operation: 'update' | 'delete'
    entry: WorkerSlotEntry | null
  }) => Promise<void>
}): Promise<() => Promise<void>> {
  const { role, handler } = parameters
  const cleanup = await eventClient.watchBucket({
    schema: WorkerSlotEntrySchema,
    bucketName: WORKER_SLOT_BUCKET_NAME,
    filter: getWorkerSlotKeyFilter({ role }),
    handler: async ({ entry, key, operation }) => {
      const parsedKey = parseWorkerSlotKey(key)

      if (!parsedKey) {
        logger.warn('Received worker slot entry with invalid key - skipping', { key })
        return
      }

      const { workerId, role } = parsedKey

      return await handler({
        workerId,
        role,
        operation,
        entry,
      })
    },
  })

  return cleanup
}
