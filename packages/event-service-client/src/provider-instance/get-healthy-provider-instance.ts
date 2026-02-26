import { ModelProvider } from '@george-ai/app-commons'

import { logger } from '../common'
import { getProviderInstances } from './get-provider-instances'
import { ProviderInstance } from './schema'

export async function getHealthyProviderInstance(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  modelName: string
}): Promise<ProviderInstance | null> {
  const { workspaceId, modelProvider, modelName } = parameters
  const allHealth = await getProviderInstances({ workspaceId, modelProvider })
  logger.info('Fetched provider health information', {
    workspaceId,
    modelProvider,
    modelName,
    instanceCount: allHealth.length,
  })
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
