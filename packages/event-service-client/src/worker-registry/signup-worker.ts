import { WORKER_TYPES } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { availableWorkerSlots } from './available-worker-slots'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, getKeyFilter, logger } from './common'
import { WorkerEntry } from './schema'

export async function signupWorker({ workerId }: { workerId: string }): Promise<WorkerEntry[]> {
  logger.debug('Worker signup initiated', { workerId })
  const keys = await eventClient.getBucketKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: getKeyFilter({ workerId }),
    limit: 100,
  })

  if (keys.length > 0) {
    logger.debug('Worker already signed up, retrieving existing keys', { workerId, keys })
    const entries = await Promise.all(
      keys.map(async (key) => {
        const data = await eventClient.getBucketEntry({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key })
        if (!data) {
          return null
        }
        return JSON.parse(new TextDecoder().decode(data)) as WorkerEntry
      }),
    )
    return entries.filter((entry): entry is WorkerEntry => entry !== null)
  }

  logger.debug('No existing worker entry found, proceeding with signup', { workerId })

  const freeWorkerTypes = await availableWorkerSlots()
  const assignedWorkerTypes = WORKER_TYPES.filter((workerType) => freeWorkerTypes[workerType] > 0)

  const newEntries = await Promise.all(
    assignedWorkerTypes.map(async (workerType) => {
      const newEntry: WorkerEntry = {
        workerId,
        workerType,
        lastHeartbeat: new Date().toISOString(),
        version: 1,
      }
      const key = getKey({ workerId, workerType })
      await eventClient.putBucketEntry({
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
