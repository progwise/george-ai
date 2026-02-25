import { WorkerType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { availableWorkerSlots } from './available-worker-slots'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, logger } from './common'
import { getWorkerEntry } from './get-worker'
import { WorkerEntry } from './schema'

export async function registerWorker({
  workerId,
  workerType,
}: {
  workerId: string
  workerType: WorkerType
}): Promise<WorkerEntry> {
  logger.info('Register worker with type initiated', { workerId, workerType })
  const key = getKey({ workerId, workerType })
  const existingEntry = await getWorkerEntry({ workerId, workerType })
  if (existingEntry) {
    logger.info('Worker already registered with type, returning existing entry', { workerId, workerType })
    return existingEntry
  }

  const freeWorkerTypes = await availableWorkerSlots(workerType)

  if (freeWorkerTypes[workerType] <= 0) {
    throw new Error(`No available slots for worker type: ${workerType}`)
  }
  const newEntry: WorkerEntry = {
    workerId,
    workerType,
    lastHeartbeat: new Date().toISOString(),
    version: 1,
  }
  await eventClient.putBucketEntry({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key,
    value: new TextEncoder().encode(JSON.stringify(newEntry)),
  })
  return newEntry
}
