import { eventClient } from '../client'
import { WORKER_TYPE_SLOTS, availableWorkerSlots } from './available-worker-slots'
import { WORKER_REGISTRY_BUCKET_NAME } from './common'
import { deleteWorker, deleteWorkerEntry } from './delete-worker'
import { getWorker, getWorkerEntry } from './get-worker'
import { updateWorkerHeartbeat } from './heartbeat'
import { registerWorker } from './register-worker'
import { type WorkerEntry, WorkerEntrySchema } from './schema'
import { signupWorker } from './signup-worker'
import { watchWorkerEntries } from './watch-worker-entries'

export async function ensureWorkerRegistryBucket() {
  await eventClient.ensureBucket({
    name: WORKER_REGISTRY_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: 5 * 60 * 1000, // 5 minutes
    },
  })
  return WORKER_REGISTRY_BUCKET_NAME
}

export { type WorkerEntry }

export default {
  WorkerEntrySchema,
  WORKER_TYPE_SLOTS,
  availableWorkerSlots,
  getWorker,
  getWorkerEntry,
  watchWorkerEntries,
  updateWorkerHeartbeat,
  deleteWorkerEntry,
  deleteWorker,
  registerWorker,
  signupWorker,
} as const

export {
  availableWorkerSlots,
  deleteWorker,
  deleteWorkerEntry,
  getWorker,
  getWorkerEntry,
  registerWorker,
  signupWorker,
  updateWorkerHeartbeat,
  watchWorkerEntries,
  WorkerEntrySchema,
  WORKER_TYPE_SLOTS,
}
