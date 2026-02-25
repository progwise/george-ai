import { WorkerType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKey, logger } from './common'
import { getWorkerEntry } from './get-worker'
import { registerWorker } from './register-worker'

export async function updateWorkerHeartbeat(parameters: { workerId: string; workerType: WorkerType }): Promise<void> {
  const { workerId, workerType } = parameters
  let entry = await getWorkerEntry({ workerId, workerType })
  if (!entry) {
    logger.warn('Worker registry entry not found for workerId. Trying to re-register the worker.', {
      workerId,
      workerType,
    })
    entry = await registerWorker({ workerId, workerType })
  }

  entry.lastHeartbeat = new Date().toISOString()
  logger.debug('Updating worker heartbeat', { workerId, workerType, lastHeartbeat: entry.lastHeartbeat })

  await eventClient.putBucketEntry({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: getKey({ workerId, workerType }),
    value: new TextEncoder().encode(JSON.stringify(entry)),
  })
}
