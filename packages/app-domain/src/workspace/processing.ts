import { publishManagementEvent, getWorkspaceStatistics as stats } from '@george-ai/event-service-client'
import { ManagementEventType } from '@george-ai/event-service-client'

import { WorkspaceProcessingType } from './types'

export const getWorkspaceStatistics = async (workspaceId: string) => {
  const data = await stats(workspaceId)
  return data
}

export const startProcessing = async (workspaceId: string, processingType: WorkspaceProcessingType) => {
  switch (processingType) {
    case 'EMBEDDING':
      await startEmbedding(workspaceId)
      break
    // Add other processing types as needed
    default:
      throw new Error(`Unsupported processing type: ${processingType}`)
  }
}

const startEmbedding = async (workspaceId: string) => {
  await publishManagementEvent({
    workspaceId,
    eventType: ManagementEventType.StartEmbedding,
    version: 1,
  })
}
