import { eventClient } from '../client'
import { logger } from '../workspace-processing/common'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, getKeyFilter, getWorkerIdFromKey, getWorkerTypeFromKey } from './common'
import { WORKER_TYPES, WorkerRegistryEntry, WorkerRegistrySchema, WorkerType } from './schema'

export async function getWorkerRegistryEntries(parameters: {
  workerId?: string
  workerType?: WorkerType
}): Promise<WorkerRegistryEntry[]> {
  const { workerId, workerType } = parameters
  const keys = await eventClient.getKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: `worker.${workerId ?? '*'}.${workerType ?? '*'}`,
    limit: WORKER_TYPES.length, // Arbitrary limit to avoid excessive results, only 1 key for WORKER_TYPES.length is expected
  })
  if (keys.length === 0) {
    return []
  }

  const entries = await Promise.all(
    keys.map(async (key) => {
      const data = await eventClient.get({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key })
      if (!data) {
        return null
      }
      return WorkerRegistrySchema.parse(JSON.parse(new TextDecoder().decode(data)))
    }),
  )
  return entries.filter((entry): entry is WorkerRegistryEntry => entry !== null)
}

export const getWorkerRegistryEntry = async ({
  workerId,
  workerType,
}: {
  workerId: string
  workerType: WorkerType
}): Promise<WorkerRegistryEntry | null> => {
  const key = getKey({ workerId, workerType })
  const data = await eventClient.get({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key })
  if (!data) {
    return null
  }
  return WorkerRegistrySchema.parse(JSON.parse(new TextDecoder().decode(data)))
}

export async function deleteWorker(workerId: string): Promise<void> {
  return Promise.all(WORKER_TYPES.map((workerType) => deleteWorkerRegistryEntry(workerId, workerType)))
    .catch(() => {})
    .then(() => {})
}

export async function deleteWorkerRegistryEntry(workerId: string, workerType: WorkerType): Promise<void> {
  await eventClient.delete({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key: getKey({ workerId, workerType }) })
}

export async function watchWorkerRegistryEntries(parameters: {
  workerType?: WorkerType
  handler: (params: {
    workerType: WorkerType
    workerId: string
    operation: 'create' | 'update' | 'delete'
    value: WorkerRegistryEntry | null
  }) => Promise<void>
}): Promise<() => void> {
  const { workerType, handler } = parameters
  return await eventClient.watch({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: getKeyFilter({ workerType }),
    handler: async (entry) => {
      const workerType = getWorkerTypeFromKey(entry.key)
      const workerId = getWorkerIdFromKey(entry.key)
      logger.debug(`Worker registry entry change detected`, { entry: entry, workerId, workerType })
      switch (entry.operation) {
        case 'create':
        case 'update': {
          const data = entry.value
            ? WorkerRegistrySchema.parse(JSON.parse(new TextDecoder().decode(entry.value)))
            : null
          if (!data) {
            logger.error('Invalid worker registry entry data', { entry, workerId, workerType })
            throw new Error('Invalid worker registry entry data')
          }
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
}

export async function getAllWorkerRegistryEntries(): Promise<WorkerRegistryEntry[]> {
  const keys = await eventClient.getKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    limit: 100,
  })

  const result = await Promise.all(
    keys.map((key) =>
      getWorkerRegistryEntry({ workerId: getWorkerIdFromKey(key), workerType: getWorkerTypeFromKey(key) }),
    ),
  )

  return result.filter((entry): entry is WorkerRegistryEntry => entry !== null)
}
