import { workerRegistry } from '@george-ai/event-service-client'

export const getWorkers = async () => {
  const workers = await workerRegistry.getWorkerRegistryEntries({ workerId: undefined, workerType: undefined })
  return workers
}
