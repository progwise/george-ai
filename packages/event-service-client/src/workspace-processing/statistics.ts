import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName } from './common'
import { ACTION_TYPES, type ActionType } from './common'

export interface WorkspaceProcessStatistics {
  actionType: ActionType
  totalMessages: number
  processedMessages: number
  pendingMessages: number
}

export async function getWorkspaceProcessStatistics(
  workspaceId: string,
  actionType: ActionType,
): Promise<WorkspaceProcessStatistics> {
  const stats = await eventClient.getStreamStatistics({
    consumerName: getConsumerName({ workspaceId, actionType }),
    streamName: WORKSPACE_STREAM_NAME,
  })
  return { actionType, ...stats }
}

export async function getWorkspaceStatistics(workspaceId: string): Promise<WorkspaceProcessStatistics[]> {
  const result = await Promise.all(
    ACTION_TYPES.map(async (actionType) => await getWorkspaceProcessStatistics(workspaceId, actionType)),
  )
  return result
}
