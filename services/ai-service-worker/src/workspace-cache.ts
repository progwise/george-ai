import { admin, workspace } from '@george-ai/events'

import { eventClient } from './event-client'
import { handleWorkspaceManagementEvents } from './workspace-management'

// Cache workspaces
const workspaceCache = new Map<
  string,
  {
    workspace: admin.WorkspaceStartupEvent
    managementSubscriptionCleanup: () => Promise<void>
  }
>()

export const ensureWorkspaceInCache = async (workspaceEvent: admin.WorkspaceStartupEvent) => {
  const workspaceEntry = workspaceCache.get(workspaceEvent.workspaceId)
  if (workspaceEntry) {
    console.warn(`Workspace ${workspaceEvent.workspaceId} already in cache`)
    workspaceEntry.workspace = workspaceEvent
    return
  }

  const managementSubscriptionCleanup = await workspace.subscribeManagementEvents(eventClient, {
    subscriptionName: `ai-service-worker-workspace-${workspaceEvent.workspaceId}-management-events`,
    workspaceId: workspaceEvent.workspaceId,
    handler: async (event) => {
      console.log(`Received management event for workspace ${workspaceEvent.workspaceId}: ${event.eventName}`)
      handleWorkspaceManagementEvents(event)
    },
  })

  workspaceCache.set(workspaceEvent.workspaceId, {
    workspace: workspaceEvent,
    managementSubscriptionCleanup,
  })
}

export const getWorkspaceEntry = (workspaceId: string) => {
  return workspaceCache.get(workspaceId)
}

export const removeWorkspaceFromCache = async (workspaceEvent: admin.WorkspaceTeardownEvent) => {
  const workspaceEntry = workspaceCache.get(workspaceEvent.workspaceId)
  if (!workspaceEntry) {
    console.warn(`Workspace ${workspaceEvent.workspaceId} not found in cache - cannot clean up`)
    return
  }
  await workspaceEntry.managementSubscriptionCleanup()
  workspaceCache.delete(workspaceEvent.workspaceId)
}

export const cleanupWorkspaceCache = async () => {
  for (const [workspaceId, entry] of workspaceCache) {
    console.log(`Cleaning up workspace ${workspaceId} from cache`)
    await entry.managementSubscriptionCleanup()
    workspaceCache.delete(workspaceId)
  }
}

export function getProviderForModel(modelName: string, workspaceId: string) {
  const { providers, languageModels } = getProviderConfig(workspaceId)
  if (!providers) {
    console.warn(`No provider config cached for workspace ${workspaceId}`)
    return null
  }

  const model = languageModels?.find((model) => model.name === modelName)
  if (!model) {
    console.warn(`Model not found in workspace ${workspaceId}: ${modelName}`)
    return null
  }

  return providers.find((provider) => provider.id === model.provider)
}

export function getProviderConfig(workspaceId: string) {
  const workspaceEntry = workspaceCache.get(workspaceId)
  if (!workspaceEntry) {
    console.warn(`No workspace cached with ID ${workspaceId}`)
    return { providers: null, languageModels: null }
  }

  return {
    providers: workspaceEntry.workspace.providers,
    languageModels: workspaceEntry.workspace.languageModels,
  }
}
