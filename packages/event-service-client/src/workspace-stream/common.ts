import { WorkspaceEventType } from './schema'

export const WORKSPACE_STREAM_NAME = 'workspace_stream'
export const WORKSPACE_STREAM_SUBJECTS = ['workspace.*']

export const getSubjectFilterForWorkspaceEvent = (workspaceId: string, eventType: WorkspaceEventType) => {
  switch (eventType) {
    case WorkspaceEventType.ExtractionRequest:
      return `workspace.${workspaceId}.extraction-request.*`
    case WorkspaceEventType.EmbeddingRequest:
      return `workspace.${workspaceId}.embedding-request.*`
    case WorkspaceEventType.EmbeddingProgress:
      return `workspace.${workspaceId}.embedding-progress.*`
    case WorkspaceEventType.EmbeddingFinished:
      return `workspace.${workspaceId}.embedding-finished.*`
  }
}
