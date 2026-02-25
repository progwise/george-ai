import { ModelProvider } from '@george-ai/app-commons'

import { getProviderInstances } from './get-provider-instances'
import { ProviderHealth } from './schema'

export async function getProviderInstance(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  modelName: string
}): Promise<ProviderHealth | null> {
  const { workspaceId, modelProvider, modelName } = parameters
  const allHealth = await getProviderInstances({ workspaceId, modelProvider })
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

export async function getProviderInstanceOrThrow(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  modelName: string
}): Promise<ProviderHealth> {
  const instance = await getProviderInstance(parameters)
  if (!instance) {
    throw new Error(
      `No healthy provider instance found for provider ${parameters.modelProvider} and model ${parameters.modelName}`,
    )
  }
  return instance
}
