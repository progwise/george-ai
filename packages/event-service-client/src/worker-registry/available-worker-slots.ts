import { WorkerType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKeyFilter, getWorkerTypeFromKey } from './common'

const MAX_WORKERS = 1000

export const WORKER_TYPE_SLOTS: Record<WorkerType, number> = {
  MODEL_CALL_RESPONDER: MAX_WORKERS,
  DOCUMENT_PROCESSING: MAX_WORKERS,
  WORKSPACE_MANAGER: 2,
  WORKER_MANAGER: MAX_WORKERS,
  PROVIDER_INSTANCE_MANAGER: 2,
  PROVIDER_INSTANCE_RESPONDER: MAX_WORKERS,
}

export async function availableWorkerSlots(workerType?: WorkerType): Promise<Record<WorkerType, number>> {
  const bucketStatus = await eventClient.getBucketStatus({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
  })
  const keys = await eventClient.getBucketKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: workerType ? getKeyFilter({ workerType }) : undefined,
    limit: bucketStatus.valueCount,
  })

  const remainingSlots = { ...WORKER_TYPE_SLOTS }
  for (const key of keys) {
    const workerType = getWorkerTypeFromKey(key)
    remainingSlots[workerType] -= 1
  }

  return remainingSlots
}
