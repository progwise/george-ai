import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKeyFilter, getWorkerTypeFromKey } from './common'
import { WorkerType } from './schema'

export const WORKER_TYPE_SLOTS: Record<WorkerType, number> = {
  AI_PROVIDER_CALLING: 1000,
  WORKSPACE_PROCESSING: 1000,
  AI_HEALTH_MANAGEMENT: 2,
}

export async function getAvailableSlots(workerType?: WorkerType): Promise<Record<WorkerType, number>> {
  const keys = await eventClient.getKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: workerType ? getKeyFilter({ workerType }) : undefined,
    limit: 1000,
  })

  const remainingSlots = { ...WORKER_TYPE_SLOTS }
  for (const key of keys) {
    const workerType = getWorkerTypeFromKey(key)
    remainingSlots[workerType] -= 1
  }

  return remainingSlots
}
