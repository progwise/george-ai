import { instanceManager } from '@george-ai/ai-service-client'
import { WorkspaceRegistryEntry } from '@george-ai/event-service-client'
import { createLogger } from '@george-ai/web-utils'

const logger = createLogger('Workspace Cache')

// Cache workspaces
const workspaceCache = new Map<string, WorkspaceRegistryEntry>()

export const ensureWorkspaceInCache = async (workspaceRegistryEntry: WorkspaceRegistryEntry) => {
  logger.info('Ensuring workspace is cached in AI Service Worker', {
    workspaceId: workspaceRegistryEntry.workspaceId,
  })
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
    logger.warn('No cached workspace found to remove', { workspaceId })
    return
  }
  logger.info('Removing workspace from AI Service Worker cache', { workspaceId })
  workspaceCache.delete(workspaceId)
}

export const cleanupWorkspaceCache = () => {
  for (const [workspaceId, entry] of workspaceCache) {
    logger.info('Cleaning up workspace from cache', {
      workspaceId,
      providerCount: entry.providerInstances.length,
    })
    // await entry.managementSubscriptionCleanup()
    workspaceCache.delete(workspaceId)
  }
}

export function getProviderConfig(workspaceId: string) {
  const workspaceEntry = workspaceCache.get(workspaceId)
  if (!workspaceEntry) {
    logger.warn('No workspace cached', { workspaceId })
    return null
  }

  return {
    providerInstances: workspaceEntry.providerInstances,
    languageModels: workspaceEntry.languageModels,
  }
}
