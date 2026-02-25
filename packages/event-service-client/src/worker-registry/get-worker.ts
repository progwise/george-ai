import { WorkerType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, logger } from './common'
import { WorkerEntry, WorkerEntrySchema } from './schema'

export async function getWorker(parameters?: { workerId?: string; workerType?: WorkerType }): Promise<WorkerEntry[]> {
  const { workerId, workerType } = parameters ?? {}

  // TODO: Should never grow significantly over 1000 * WORKER_TYPES but we need to warn if it does.
  const { valueCount } = await eventClient.getBucketStatus({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
  })
  const keys = await eventClient.getBucketKeys({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    filter: `worker.${workerId ?? '*'}.${workerType ?? '*'}`,
    limit: valueCount,
  })
  if (keys.length === 0) {
    return []
  }

  const entries = await Promise.all(
    keys.map(async (key) => {
      const data = await eventClient.getBucketEntry({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key })
      if (!data) {
        return null
      }
      const rawData = new TextDecoder().decode(data)
      const jsonData = JSON.parse(rawData)
      const parseResult = WorkerEntrySchema.safeParse(jsonData)
      if (!parseResult.success) {
        logger.error('Failed to parse worker entry data', { workerId, workerType, error: parseResult.error })
        return null
      }
      return parseResult.data
    }),
  )
  return entries.filter((entry): entry is WorkerEntry => entry !== null)
}

export const getWorkerEntry = async ({
  workerId,
  workerType,
}: {
  workerId: string
  workerType: WorkerType
}): Promise<WorkerEntry | null> => {
  const key = getKey({ workerId, workerType })
  const data = await eventClient.getBucketEntry({ bucketName: WORKER_REGISTRY_BUCKET_NAME, key })
  if (!data) {
    return null
  }
  const rawData = new TextDecoder().decode(data)
  const jsonData = JSON.parse(rawData)
  const parseResult = WorkerEntrySchema.safeParse(jsonData)
  if (!parseResult.success) {
    logger.error('Failed to parse worker entry data', { workerId, workerType, error: parseResult.error })
    return null
  }
  return parseResult.data
}
