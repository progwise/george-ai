import { getWorkspaceStatistics as stats } from '@george-ai/event-service-client'

export const getWorkspaceStatistics = async (workspaceId: string) => {
  const data = await stats(workspaceId)
  return data
}
