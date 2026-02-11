import { PROCESSING_REQUEST_TYPES, type ProcessingRequestType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getConsumerName } from './common'

export interface WorkspaceProcessStatistics {
  requestType: ProcessingRequestType
  totalMessages: number
  processedMessages: number
  pendingMessages: number
}

export async function getWorkspaceProcessStatistics(
  workspaceId: string,
  requestType: ProcessingRequestType,
): Promise<WorkspaceProcessStatistics> {
  const stats = await eventClient.getStreamStatistics({
    consumerName: getConsumerName({ workspaceId, requestType }),
    streamName: WORKSPACE_STREAM_NAME,
  })
  return { requestType, ...stats }
}

export async function getWorkspaceStatistics(workspaceId: string): Promise<WorkspaceProcessStatistics[]> {
  const result = await Promise.all(
    PROCESSING_REQUEST_TYPES.map(async (requestType) => await getWorkspaceProcessStatistics(workspaceId, requestType)),
  )
  return result
}
