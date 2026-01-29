import { eventClient } from '../client'
import { logger } from '../model-calls/common'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, getKeyFilter } from './common'
import { WorkerRegistryEntry, WorkerType } from './schema'

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

  const assignedWorkerTypes: WorkerType[] = ['AI_PROVIDER_CALLING', 'WORKSPACE_PROCESSING']

  const currentProviderManagerEntries = await eventClient.getKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: getKeyFilter({ workerType: 'AI_HEALTH_MANAGEMENT' }),
    limit: 1000,
  })

  if (currentProviderManagerEntries.length < 2) {
    assignedWorkerTypes.push('AI_HEALTH_MANAGEMENT')
  } else {
    logger.info('Maximum AI_HEALTH_MANAGEMENT workers reached, not assigning to this worker', {
      workerId,
      currentProviderManagerEntries,
    })
  }

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
