import { eventClient } from '../client'
import { WORKSPACE_STREAM_NAME, WORKSPACE_STREAM_SUBJECTS } from './common'

export { publishWorkspaceEvent } from './publish'
export { subscribeWorkspaceEvent } from './subscribe'
export { getWorkspaceEventStatistics, getWorkspaceStatistics } from './statistics'

export const initializeWorkspaceStream = async () => {
  await eventClient.ensureStream({
    streamName: WORKSPACE_STREAM_NAME,
    description: `Events for all workspaces`,
    subjects: WORKSPACE_STREAM_SUBJECTS,
    persist: true,
  })
  return WORKSPACE_STREAM_NAME
}
