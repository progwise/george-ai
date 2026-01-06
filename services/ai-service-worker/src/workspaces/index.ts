import { instanceManager } from '@george-ai/ai-service-client'
import { WorkspaceRegistryEntry } from '@george-ai/event-service-client'

// Cache workspaces
const workspaceCache = new Map<string, WorkspaceRegistryEntry>()

export const ensureWorkspaceInCache = async (workspaceRegistryEntry: WorkspaceRegistryEntry) => {
  console.log(`Ensuring workspace ${workspaceRegistryEntry.workspaceId} is cached in AI Service Worker`)
  workspaceCache.set(workspaceRegistryEntry.workspaceId, workspaceRegistryEntry)
  await instanceManager.setWorkspaceProviderInstances(
    workspaceRegistryEntry.workspaceId,
    workspaceRegistryEntry.providerInstances,
  )
}

export const getWorkspaceEntry = (workspaceId: string) => {
  return workspaceCache.get(workspaceId)
}

export const removeWorkspaceFromCache = (workspaceId: string) => {
  const workspaceEntry = workspaceCache.get(workspaceId)
  if (!workspaceEntry) {
    console.warn(`No cached workspace found with ID ${workspaceId} to remove`)
    return
  }
  console.log(`Removing workspace ${workspaceId} from AI Service Worker cache`)
  workspaceCache.delete(workspaceId)
}

export const cleanupWorkspaceCache = () => {
  for (const [workspaceId, entry] of workspaceCache) {
    console.log(`Cleaning up workspace ${workspaceId} from cache with ${entry.providerInstances.length} providers`)
    // await entry.managementSubscriptionCleanup()
    workspaceCache.delete(workspaceId)
  }
}

export function getProviderConfig(workspaceId: string) {
  const workspaceEntry = workspaceCache.get(workspaceId)
  if (!workspaceEntry) {
    console.warn(`No workspace cached with ID ${workspaceId}`)
    return { providers: null, languageModels: null }
  }

  return {
    providerInstances: workspaceEntry.providerInstances,
    languageModels: workspaceEntry.languageModels,
  }
}
