import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME } from './common'
import {
  deleteWorker,
  deleteWorkerRegistryEntry,
  getAllWorkerRegistryEntries,
  getWorkerRegistryEntries,
  getWorkerRegistryEntry,
  watchWorkerRegistryEntries,
} from './entry'
import { updateWorkerHeartbeat } from './heartbeat'
import { WORKER_TYPES, type WorkerRegistryEntry, WorkerRegistrySchema, type WorkerType } from './schema'
import { signup } from './signup'

export async function initializeWorkerRegistryBucket() {
  await eventClient.ensureBucket({
    name: WORKER_REGISTRY_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: 2 * 60 * 1000, // 5 minutes
    },
  })
  return WORKER_REGISTRY_BUCKET_NAME
}

export { type WorkerRegistryEntry, type WorkerType }

export default {
  WorkerRegistrySchema,
  WORKER_TYPES,
  getWorkerRegistryEntry,
  getWorkerRegistryEntries,
  watchWorkerRegistryEntries,
  updateWorkerHeartbeat,
  getAllWorkerRegistryEntries,
  deleteWorkerRegistryEntry,
  deleteWorker,
  signup,
} as const
