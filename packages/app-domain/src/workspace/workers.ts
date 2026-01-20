import { workerRegistry, workspaceProcessing } from '@george-ai/event-service-client'

export const getWorkerStatistics = async (workspaceId: string) => {
  const status = workspaceProcessing.getWorkspaceStatistics(workspaceId)
  const workerEntries = await workerRegistry.getWorkerRegistryEntries({ workerId: undefined, workerType: undefined })
  const statistics = workerEntries.map((entry) => ({
    workerId: entry.workerId,
    workerType: entry.workerType,
    lastHeartbeat: entry.lastHeartbeat,
  }))
  return { status, workers: statistics }
}
