import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME } from './common'
import { WorkerRegistryEntry, WorkerRegistrySchema } from './schema'

export { type WorkerRegistryEntry, WorkerRegistrySchema } from './schema'

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

export async function getWorkerRegistryEntry(workerId: string): Promise<WorkerRegistryEntry | null> {
  const data = await eventClient.get({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key: workerId })
  if (!data) {
    return null
  }
  return WorkerRegistrySchema.parse(JSON.parse(new TextDecoder().decode(data)))
}

export async function putWorkerRegistryEntry(value: WorkerRegistryEntry): Promise<void> {
  const valueBytes = new TextEncoder().encode(JSON.stringify(value))
  await eventClient.put({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key: value.workerId, value: valueBytes })
}

export async function watchWorkerRegistryEntry(
  workerId: string,
  handler: (params: {
    workerId: string
    operation: 'create' | 'update' | 'delete'
    value: WorkerRegistryEntry | null
  }) => Promise<void>,
): Promise<() => void> {
  return await eventClient.watch({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: workerId,
    handler: async (entry) => {
      switch (entry.operation) {
        case 'create':
        case 'update': {
          const data = entry.value
            ? WorkerRegistrySchema.parse(JSON.parse(new TextDecoder().decode(entry.value)))
            : null
          return await handler({ workerId, operation: 'update', value: data })
        }
        case 'delete':
          await handler({ workerId, operation: 'delete', value: null })
          return
      }
    },
  })
}
