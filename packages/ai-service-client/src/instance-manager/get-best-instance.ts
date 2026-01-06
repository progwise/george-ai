import { Semaphore } from '../semaphore'
import { ServiceProviderType } from '../types'
import { getInstanceLoad } from './get-instance-load'
import { getWorkspaceCache } from './instance-cache'

export const getBestInstance = async (args: {
  workspaceId: string
  provider: string
  modelName: string
}): Promise<{ provider: ServiceProviderType; url?: string; apiKey?: string; semaphore: Semaphore }> => {
  const { provider, workspaceId, modelName } = args
  const workspaceCache = getWorkspaceCache(workspaceId)

  const instances = workspaceCache.filter(
    (item) =>
      item.provider === provider &&
      item.status === 'online' &&
      item.models.some(
        (model) => ('name' in model && model.name === modelName) || ('id' in model && model.id === modelName),
      ),
  )

  if (instances.length === 0) {
    throw new Error(`No available instances found for model ${modelName} and provider ${provider}`)
  }

  if (instances.length === 1) {
    return instances[0]
  }

  const evaluatedInstances = await Promise.all(
    instances.map(async (instance) => {
      const queueLength = instance.semaphore.queueLength()
      const availablePermits = instance.semaphore.permitsAvailable()
      const load = await getInstanceLoad({
        provider: instance.provider,
        url: instance.endpoint.url,
        apiKey: instance.endpoint.apiKey,
        vramGB: instance.configuredMemorySizeMB ? instance.configuredMemorySizeMB / 1024 : undefined,
      })
      return {
        ...instance,
        queueLength,
        availablePermits,
        vramUsageMB: load ? load.vramUsageMB : -1,
      }
    }),
  )

  evaluatedInstances.sort((a, b) => {
    if (a.availablePermits !== b.availablePermits) {
      return b.availablePermits - a.availablePermits
    }
    if (a.queueLength !== b.queueLength) {
      return a.queueLength - b.queueLength
    }
    return a.vramUsageMB - b.vramUsageMB
  })
  const bestInstance = evaluatedInstances[0]

  return bestInstance
}
