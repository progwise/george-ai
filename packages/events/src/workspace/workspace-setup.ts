import { EventClient } from '@george-ai/event-service-client'

const initializedWorkspaces: Array<string> = []

const getWorkspaceStreamName = (workspaceId: string) => `workspace-${workspaceId}`

export const ensureWorkspaceStream = async (client: EventClient, workspaceId: string) => {
  const streamName = getWorkspaceStreamName(workspaceId)
  if (initializedWorkspaces.includes(workspaceId)) return streamName

  const subjects = `workspace.${workspaceId}.*`

  await client.ensureStream({
    streamName,
    description: `Events for workspace ${workspaceId}`,
    subjects: [subjects],
    persist: true,
  })
  initializedWorkspaces.push(workspaceId)
  return streamName
}
