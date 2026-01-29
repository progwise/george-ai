import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName } from './common'
import { ACTION_TYPES, type ActionType } from './common'

export async function getWorkspaceProcessStatistics(workspaceId: string, actionType: ActionType) {
  const stats = await eventClient.getStreamStatistics({
    consumerName: getConsumerName({ workspaceId, actionType }),
    streamName: WORKSPACE_STREAM_NAME,
  })
  return stats
}

export async function getWorkspaceStatistics(workspaceId: string) {
  const result = await Promise.all(
    ACTION_TYPES.map(async (actionType) => {
      const stats = await getWorkspaceProcessStatistics(workspaceId, actionType)
      return { actionType, ...stats }
    }),
  )
  return result
}
