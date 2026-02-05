import { eventClient } from '../client'
import { logger } from './common'
import { WORKER_REGISTRY_BUCKET_NAME, getKey } from './common'
import { getAvailableSlots } from './get-available-slots'
import { WorkerRegistryEntry, WorkerType } from './schema'

export async function register({
  workerId,
  workerType,
}: {
  workerId: string
  workerType: WorkerType
}): Promise<WorkerRegistryEntry> {
  logger.info('Register worker with type initiated', { workerId, workerType })
  const key = getKey({ workerId, workerType })
  const data = await eventClient.get({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key,
  })

  if (data) {
    logger.debug('Worker already registered with type, retrieving existing entry', { workerId, workerType })
    const decodedData = new TextDecoder().decode(data)
    logger.debug('Decoded worker registry entry data', { workerId, workerType, decodedData })
    if (decodedData.length > 0) {
      return JSON.parse(decodedData) as WorkerRegistryEntry
    }
  }

  const freeWorkerTypes = await getAvailableSlots(workerType)

  if (freeWorkerTypes[workerType] <= 0) {
    throw new Error(`No available slots for worker type: ${workerType}`)
  }
  const newEntry: WorkerRegistryEntry = {
    workerId,
    workerType,
    lastHeartbeat: new Date().toISOString(),
    version: 1,
  }
  await eventClient.put({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key,
    value: new TextEncoder().encode(JSON.stringify(newEntry)),
  })
  return newEntry
}
