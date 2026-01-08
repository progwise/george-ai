import { instanceManager } from '@george-ai/ai-service-client'
import { WorkspaceRegistryEntry } from '@george-ai/event-service-client'
import { createLogger } from '@george-ai/web-utils'

const logger = createLogger('Workspace Cache')

// Cache workspaces
const workspaceCache = new Map<string, WorkspaceRegistryEntry>()

export const ensureWorkspaceInCache = async (workspaceRegistryEntry: WorkspaceRegistryEntry) => {
  logger.info(`Ensuring workspace ${workspaceRegistryEntry.workspaceId} is cached in AI Service Worker`)
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
    logger.warn(`No cached workspace found with ID ${workspaceId} to remove`)
    return
  }
  logger.info(`Removing workspace ${workspaceId} from AI Service Worker cache`)
  workspaceCache.delete(workspaceId)
}

export const cleanupWorkspaceCache = () => {
  for (const [workspaceId, entry] of workspaceCache) {
    logger.info(`Cleaning up workspace ${workspaceId} from cache with ${entry.providerInstances.length} providers`)
    // await entry.managementSubscriptionCleanup()
    workspaceCache.delete(workspaceId)
  }
}

export function getProviderConfig(workspaceId: string) {
  const workspaceEntry = workspaceCache.get(workspaceId)
  if (!workspaceEntry) {
    logger.warn(`No workspace cached with ID ${workspaceId}`)
    return null
  }

  return {
    providerInstances: workspaceEntry.providerInstances,
    languageModels: workspaceEntry.languageModels,
  }
}
