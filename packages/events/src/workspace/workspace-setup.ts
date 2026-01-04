import { eventClient } from '../shared'

const initializedWorkspaces: Array<string> = []

const getWorkspaceStreamName = (workspaceId: string) => `workspace-${workspaceId}`

export const ensureWorkspaceStream = async (workspaceId: string) => {
  const streamName = getWorkspaceStreamName(workspaceId)
  if (initializedWorkspaces.includes(workspaceId)) return streamName

  const subjects = `workspace.${workspaceId}.*`

  await eventClient.ensureStream({
    streamName,
    description: `Events for workspace ${workspaceId}`,
    subjects: [subjects],
    persist: true,
  })
  initializedWorkspaces.push(workspaceId)
  return streamName
}
