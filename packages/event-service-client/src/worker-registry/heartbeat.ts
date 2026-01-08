import { getWorkerRegistryEntry, putWorkerRegistryEntry } from './entry'

export async function updateWorkerHeartbeat(workerId: string): Promise<void> {
  const entry = await getWorkerRegistryEntry(workerId)
  if (!entry) {
    throw new Error(`Worker registry entry not found for workerId: ${workerId}`)
  }

  entry.lastHeartbeat = new Date().toISOString()

  await putWorkerRegistryEntry(entry)
}
