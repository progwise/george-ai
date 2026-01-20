import { workspaceProcessing } from '@george-ai/event-service-client'

export const getWorkspaceStatistics = async (workspaceId: string) => {
  const data = await workspaceProcessing.getWorkspaceStatistics(workspaceId)
  return data
}
