import { ModelProvider } from '@george-ai/app-commons'

import { eventClient } from '../client'
import { HEALTH_STATUS, PROVIDER_HEALTH_BUCKET_NAME, getKey, getWildcardKey } from './common'
import { type ProviderHealth, ProviderHealthSchema } from './schema'

export { type ProviderHealth } from './schema'

export async function initializeProviderHealthBucket() {
  await eventClient.ensureBucket({
    name: PROVIDER_HEALTH_BUCKET_NAME,
    options: {
      history: 0,
      ttlMs: 60 * 1000,
    },
  })
  return PROVIDER_HEALTH_BUCKET_NAME
}

async function getProviderInstancesHealth(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
}): Promise<ProviderHealth[]> {
  const { workspaceId, modelProvider } = parameters

  const filter = getWildcardKey({ workspaceId, modelProvider })
  const keys = await eventClient.getKeys({
    bucketName: PROVIDER_HEALTH_BUCKET_NAME,
    filter,
  })

  const healthEntries = await Promise.all(
    keys.map(async (key) => {
      const data = await eventClient.get({
        bucketName: PROVIDER_HEALTH_BUCKET_NAME,
        key,
      })
      if (!data) {
        return null
      }
      const decodedData = new TextDecoder().decode(data)
      return ProviderHealthSchema.parse(JSON.parse(decodedData))
    }),
  )
  return healthEntries.filter((health): health is ProviderHealth => health !== null)
}

async function getProviderInstanceForDirectCall(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  modelName: string
}): Promise<ProviderHealth | null> {
  const { workspaceId, modelProvider, modelName } = parameters
  const allHealth = await getProviderInstancesHealth({ workspaceId, modelProvider })
  const suitableInstances = allHealth.filter(
    (health) => health.status === 'healthy' && health.availableModelNames?.includes(modelName),
  )
  if (suitableInstances.length === 0) {
    return null
  }
  const loadedModelInstances = suitableInstances.filter((health) => health.loadedModelNames?.includes(modelName))
  if (loadedModelInstances.length > 0) {
    return loadedModelInstances.sort((a, b) => (a.processorUsagePercent ?? 0) - (b.processorUsagePercent ?? 0))[0]
  }
  return suitableInstances.sort((a, b) => (a.usedMemoryMb ?? 0) - (b.usedMemoryMb ?? 0))[0]
}

async function writeProviderInstanceHealth(health: ProviderHealth): Promise<void> {
  const key = getKey({
    workspaceId: health.workspaceId,
    modelProvider: health.providerInstance.modelProvider,
    providerInstanceId: health.providerInstance.id,
  })
  const valueBytes = new TextEncoder().encode(JSON.stringify(health))
  await eventClient.put({
    bucketName: PROVIDER_HEALTH_BUCKET_NAME,
    key,
    value: valueBytes,
  })
}

async function watchProviderHealth(
  workspaceId: string,
  handler: (params: { operation: 'create' | 'update' | 'delete'; value: ProviderHealth | null }) => Promise<void>,
): Promise<() => Promise<void>> {
  return await eventClient.watch({
    bucketName: PROVIDER_HEALTH_BUCKET_NAME,
    key: getWildcardKey({ workspaceId }),
    handler: async (entry) => {
      switch (entry.operation) {
        case 'create':
        case 'update': {
          const healthEntry = entry.value ? (JSON.parse(new TextDecoder().decode(entry.value)) as ProviderHealth) : null
          return await handler({ operation: entry.operation, value: healthEntry })
        }
        case 'delete':
          await handler({ operation: 'delete', value: null })
          return
      }
    },
  })
}

export default {
  getProviderInstanceForDirectCall,
  getProviderInstancesHealth,
  writeProviderInstanceHealth,
  watchProviderHealth,
  HEALTH_STATUS,
}
