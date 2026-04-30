import { WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKey, getWorkerSlotKeyFilter, logger } from './common'

export async function deleteWorkerSlots(workerId: string): Promise<void> {
  return await eventClient.deleteBucketEntries({
    bucketName: WORKER_SLOT_BUCKET_NAME,
    filter: getWorkerSlotKeyFilter({ workerId }),
  })
}

export async function deleteWorkerSlot(workerId: string, role: WorkerRole): Promise<void> {
  await eventClient.deleteBucketEntry({
    bucketName: WORKER_SLOT_BUCKET_NAME,
    key: getWorkerSlotKey({ workerId, role }),
  })
  logger.debug('Deleted worker slot entry', { workerId, role })
}
