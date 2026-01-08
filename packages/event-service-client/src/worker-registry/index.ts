import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME } from './common'

export { type WorkerRegistryEntry, WorkerRegistrySchema } from './schema'
export { getWorkerRegistryEntry, putWorkerRegistryEntry, watchWorkerRegistryEntry } from './entry'
export { updateWorkerHeartbeat } from './heartbeat'
export { addWorkspaceToWorkerEntry, removeWorkspaceFromWorkerEntry } from './subscription-management'

export async function initializeWorkerRegistryBucket() {
  await eventClient.ensureBucket({
    name: WORKER_REGISTRY_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: 5 * 60 * 1000, // 5 minutes
    },
  })
  return WORKER_REGISTRY_BUCKET_NAME
}
