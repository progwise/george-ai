import { DiscoveredModel } from '../ollama'
import { Semaphore } from '../semaphore'
import { InstanceStatus, ServiceProviderType } from '../types'
import { getAvailableModels } from './get-available-models'
import { getInstanceStatus } from './get-instance-status'

interface CacheItem {
  provider: ServiceProviderType
  endpoint: {
    url?: string
    apiKey?: string
  }
  configuredMemorySizeMB?: number
  semaphore: Semaphore
  status: InstanceStatus
  models: DiscoveredModel[]
}

const instanceCache = new Map<string, CacheItem[]>()

export const getWorkspaceCache = (workspaceId: string) => {
  if (!instanceCache.has(workspaceId)) {
    instanceCache.set(workspaceId, [])
  }
  return instanceCache.get(workspaceId)!
}

export const getProviderInstances = (args: { workspaceId: string; provider: ServiceProviderType }) => {
  const { workspaceId, provider } = args
  const workspaceCache = getWorkspaceCache(workspaceId)
  return workspaceCache.filter((item) => item.provider === provider)
}

export const addProviderInstance = async (args: {
  workspaceId: string
  provider: ServiceProviderType
  options?: { url?: string; apiKey?: string; configuredMemorySizeMB?: number }
}) => {
  const { workspaceId, provider, options } = args

  const [status, models] = await Promise.all([
    getInstanceStatus({
      provider,
      url: options?.url,
      apiKey: options?.apiKey,
    }).catch(() => 'unknown' as InstanceStatus),
    getAvailableModels({
      provider,
      url: options?.url,
      apiKey: options?.apiKey,
    }).catch(() => []),
  ])

  const workspaceCache = getWorkspaceCache(workspaceId)

  workspaceCache.push({
    provider,
    endpoint: {
      url: options?.url,
      apiKey: options?.apiKey,
    },
    configuredMemorySizeMB: options?.configuredMemorySizeMB,
    semaphore: new Semaphore(1),
    status,
    models,
  })
}

export const removeWorkspaceFromCache = (workspaceId: string) => {
  instanceCache.delete(workspaceId)
}
