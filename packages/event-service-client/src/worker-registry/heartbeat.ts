import { eventClient } from '../client'
import { logger } from '../common'
import { WORKER_REGISTRY_BUCKET_NAME, getKey } from './common'
import { getWorkerRegistryEntry } from './entry'
import { register } from './register'
import { WorkerType } from './schema'

export async function updateWorkerHeartbeat(parameters: { workerId: string; workerType: WorkerType }): Promise<void> {
  const { workerId, workerType } = parameters
  let entry = await getWorkerRegistryEntry({ workerId, workerType })
  if (!entry) {
    logger.warn('Worker registry entry not found for workerId. Trying to re-register the worker.', {
      workerId,
      workerType,
    })
    entry = await register({ workerId, workerType })
  }

  entry.lastHeartbeat = new Date().toISOString()
  logger.debug('Updating worker heartbeat', { workerId, workerType, lastHeartbeat: entry.lastHeartbeat })

  await eventClient.put({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: getKey({ workerId, workerType }),
    value: new TextEncoder().encode(JSON.stringify(entry)),
  })
}
