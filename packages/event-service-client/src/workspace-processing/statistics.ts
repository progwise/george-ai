import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName } from './common'
import { PROCESS_TYPES, ProcessType } from './schema'

export async function getWorkspaceProcessStatistics(workspaceId: string, processType: ProcessType) {
  const stats = await eventClient.getStreamStatistics({
    consumerName: getConsumerName({ workspaceId, processType }),
    streamName: WORKSPACE_STREAM_NAME,
  })
  return stats
}

export async function getWorkspaceStatistics(workspaceId: string) {
  const result = await Promise.all(
    PROCESS_TYPES.map(async (processType) => {
      const stats = await getWorkspaceProcessStatistics(workspaceId, processType)
      return { processType, ...stats }
    }),
  )
  return result
}
