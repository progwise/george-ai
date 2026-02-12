import { PROCESSING_REQUEST_TYPES, type ProcessingRequestType } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { logger } from '../common'
import { WORKSPACE_STREAM_NAME, getConsumerName } from './common'
import { ensureWorkspaceConsumer } from './consumers'

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
  const consumerName = getConsumerName({ workspaceId, requestType })
  const streamName = WORKSPACE_STREAM_NAME
  try {
    await ensureWorkspaceConsumer({ workspaceId, requestType })
    const stats = await eventClient.getStreamStatistics({
      consumerName,
      streamName,
    })
    return { requestType, ...stats }
  } catch (error) {
    logger.error('Error fetching workspace process statistics for request type', {
      error,
      workspaceId,
      requestType,
      consumerName,
      streamName,
    })
    throw new Error(
      `Failed to fetch workspace process statistics for request type ${requestType}: ${(error as Error).message}`,
    )
  }
}

export async function getWorkspaceStatistics(workspaceId: string): Promise<WorkspaceProcessStatistics[]> {
  const settled = await Promise.allSettled(
    PROCESSING_REQUEST_TYPES.map(async (requestType) => await getWorkspaceProcessStatistics(workspaceId, requestType)),
  )
  const result: WorkspaceProcessStatistics[] = []
  for (const stat of settled) {
    if (stat.status === 'fulfilled') {
      result.push(stat.value)
    } else {
      // Log the error but continue processing other statistics
      logger.error('Error fetching workspace process statistics', {
        error: stat.reason,
        workspaceId,
      })
    }
  }
  return result
}
