import { getWorkerRegistryEntry, updateWorker } from './entry'
import { WorkerType } from './schema'

export async function updateWorkerHeartbeat(parameters: { workerId: string; workerType: WorkerType }): Promise<void> {
  const { workerId, workerType } = parameters
  const entry = await getWorkerRegistryEntry({ workerId, workerType })
  if (!entry) {
    throw new Error(`Worker registry entry not found for workerId: ${workerId}`)
  }

  entry.lastHeartbeat = new Date().toISOString()

  await updateWorker(entry)
}
