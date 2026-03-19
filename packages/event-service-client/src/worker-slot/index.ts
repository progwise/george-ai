import { eventClient } from '../client'
import { WORKER_SLOT_BUCKET_NAME } from './common'
import { deleteWorkerSlot, deleteWorkerSlots } from './delete'
import { getWorkerSlotEntry, getWorkerSlots } from './get'
import { heartbeatWorkerSlot } from './heartbeat'
import { reportWorkerActivity } from './report-activity'
import { signupWorker } from './signup-worker'
import { workerSlotStats } from './stats'
import { watchWorkerSlots } from './watch'

export async function ensureWorkerSlotBucket() {
  await eventClient.ensureBucket({
    name: WORKER_SLOT_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: 2 * 60 * 1000, // 2 minutes
    },
  })
  return WORKER_SLOT_BUCKET_NAME
}

export * from './schema'

export default {
  deleteWorkerSlot,
  deleteWorkerSlots,
  getWorkerSlotEntry,
  getWorkerSlots,
  heartbeatWorkerSlot,
  reportWorkerActivity,
  signupWorker,
  watchWorkerSlots,
  workerSlotStats,
} as const

export {
  deleteWorkerSlot,
  deleteWorkerSlots,
  getWorkerSlotEntry,
  getWorkerSlots,
  heartbeatWorkerSlot,
  reportWorkerActivity,
  signupWorker,
  watchWorkerSlots,
  workerSlotStats,
}
