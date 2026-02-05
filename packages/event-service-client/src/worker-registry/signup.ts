import { eventClient } from '../client'
import { logger } from './common'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, getKeyFilter } from './common'
import { getAvailableSlots } from './get-available-slots'
import { WORKER_TYPES, WorkerRegistryEntry } from './schema'

export async function signup({ workerId }: { workerId: string }): Promise<WorkerRegistryEntry[]> {
  logger.info('Worker signup initiated', { workerId })
  const keys = await eventClient.getKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: getKeyFilter({ workerId }),
    limit: 100,
  })

  if (keys.length > 0) {
    logger.info('Worker already signed up, retrieving existing keys', { workerId, keys })
    const entries = await Promise.all(
      keys.map(async (key) => {
        const data = await eventClient.get({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key })
        if (!data) {
          return null
        }
        return JSON.parse(new TextDecoder().decode(data)) as WorkerRegistryEntry
      }),
    )
    return entries.filter((entry): entry is WorkerRegistryEntry => entry !== null)
  }

  const freeWorkerTypes = await getAvailableSlots()
  const assignedWorkerTypes = WORKER_TYPES.filter((workerType) => freeWorkerTypes[workerType] > 0)

  const newEntries = await Promise.all(
    assignedWorkerTypes.map(async (workerType) => {
      const newEntry: WorkerRegistryEntry = {
        workerId,
        workerType,
        lastHeartbeat: new Date().toISOString(),
        version: 1,
      }
      const key = getKey({ workerId, workerType })
      await eventClient.put({
        bucketName: WORKER_REGISTRY_BUCKET_NAME,
        key,
        value: new TextEncoder().encode(JSON.stringify(newEntry)),
      })
      return newEntry
    }),
  )

  logger.info('Worker signup completed', { workerId, assignedWorkerTypes })

  return newEntries
}
