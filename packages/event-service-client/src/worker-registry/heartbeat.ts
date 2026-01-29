import { eventClient } from '../client'
import { WORKER_REGISTRY_BUCKET_NAME, getKey } from './common'
import { getWorkerRegistryEntry } from './entry'
import { WorkerType } from './schema'

export async function updateWorkerHeartbeat(parameters: { workerId: string; workerType: WorkerType }): Promise<void> {
  const { workerId, workerType } = parameters
  const entry = await getWorkerRegistryEntry({ workerId, workerType })
  if (!entry) {
    throw new Error(`Worker registry entry not found for workerId: ${workerId}`)
  }

  entry.lastHeartbeat = new Date().toISOString()

  await eventClient.put({
    bucketName: WORKER_REGISTRY_BUCKET_NAME,
    key: getKey({ workerId, workerType }),
    value: new TextEncoder().encode(JSON.stringify(entry)),
  })
}
