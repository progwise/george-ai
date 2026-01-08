import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, getSubjectFilterForWorkspaceEvent } from './common'
import { WorkspaceEventType } from './schema'

export async function getWorkspaceEventStatistics(workspaceId: string, eventType: WorkspaceEventType) {
  const subjectFilter = getSubjectFilterForWorkspaceEvent(workspaceId, eventType)
  const stats = await eventClient.getStreamStatistics({
    streamName: WORKSPACE_STREAM_NAME,
    subjectFilter,
  })
  return stats
}

export async function getWorkspaceStatistics(workspaceId: string) {
  const [extractionStats, embeddingRequestStats, embeddingProgressStats, embeddingFinishedStats] = await Promise.all([
    getWorkspaceEventStatistics(workspaceId, WorkspaceEventType.ExtractionRequest),
    getWorkspaceEventStatistics(workspaceId, WorkspaceEventType.EmbeddingRequest),
    getWorkspaceEventStatistics(workspaceId, WorkspaceEventType.EmbeddingProgress),
    getWorkspaceEventStatistics(workspaceId, WorkspaceEventType.EmbeddingFinished),
  ])

  return {
    extractionRequests: extractionStats,
    embeddingRequests: embeddingRequestStats,
    embeddingProgress: embeddingProgressStats,
    embeddingFinished: embeddingFinishedStats,
  }
}
