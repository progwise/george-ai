import { WORKER_TYPES, WorkerType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, logger } from './common'

export async function deleteWorker(workerId: string): Promise<void> {
  return Promise.all(WORKER_TYPES.map((workerType) => deleteWorkerEntry(workerId, workerType)))
    .catch((error) => {
      logger.warn('Failed to delete worker registry entry, it may have already been deleted', { workerId, error })
    })
    .then(() => {
      logger.debug('Deleted worker registry entries for worker', { workerId })
    })
}

export async function deleteWorkerEntry(workerId: string, workerType: WorkerType): Promise<void> {
  await eventClient.deleteBucketEntry({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: getKey({ workerId, workerType }),
  })
  logger.debug('Deleted worker registry entry', { workerId, workerType })
}
