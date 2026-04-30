import { WorkerRole } from '@george-ai/app-schema'

import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME, getWorkerSlotKey, getWorkerSlotKeyFilter } from './common'
import { WorkerSlotEntry, WorkerSlotEntrySchema } from './schema'

export async function getWorkerSlots(parameters?: {
  workerId?: string
  role?: WorkerRole
}): Promise<WorkerSlotEntry[]> {
  const { workerId, role } = parameters ?? {}
  const filter = getWorkerSlotKeyFilter({ workerId, role })

  const entries = await eventClient.getBucketEntries({
    bucketName: WORKER_SLOT_BUCKET_NAME,
    filter,
    schema: WorkerSlotEntrySchema,
  })

  return entries.map((entry) => entry.value)
}

export const getWorkerSlotEntry = async ({
  workerId,
  role,
}: {
  workerId: string
  role: WorkerRole
}): Promise<{ revision: number; entry: WorkerSlotEntry } | null> => {
  const key = getWorkerSlotKey({ workerId, role })
  const result = await eventClient.getBucketEntry({
    bucketName: WORKER_SLOT_BUCKET_NAME,
    key,
    schema: WorkerSlotEntrySchema,
  })
  if (!result) {
    return null
  }
  const { revision, value } = result
  return { revision, entry: value }
}
