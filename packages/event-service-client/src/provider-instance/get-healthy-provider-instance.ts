import { ModelProvider } from '@george-ai/app-commons'

import { requestProviderInstance } from '.'
import { logger } from '../common'
import { getProviderInstances } from './get-provider-instances'
import { ProviderInstance } from './schema'

const instanceComparer = (a: ProviderInstance, b: ProviderInstance) =>
  (b.totalMemoryMb ?? 0) - (b.usedMemoryMb ?? 0) - (a.totalMemoryMb ?? 0) + (a.usedMemoryMb ?? 0)

export async function getHealthyProviderInstance(parameters: {
  workspaceId: string
  modelProvider: ModelProvider
  modelName: string
}): Promise<ProviderInstance | null> {
  const { workspaceId, modelProvider, modelName } = parameters
  const allInstances = await getProviderInstances({ workspaceId, modelProvider })
  logger.debug('Fetched provider health information', {
    workspaceId,
    modelProvider,
    modelName,
    instanceCount: allInstances.length,
  })

  const modelProviderInstances = allInstances.filter((instance) => instance.modelProvider === modelProvider)

  if (modelProviderInstances.length < 1) {
    return null
  }

  const modelInstances = modelProviderInstances
    .filter((instance) => instance.availableModelNames?.includes(modelName))
    .sort(instanceComparer)

  const healthyInstances = modelInstances.filter((instance) => instance.status === 'healthy').sort(instanceComparer)

  const healthyInstancesModelLoaded = modelInstances
    .filter((instance) => instance.loadedModelNames?.includes(modelName))
    .sort(instanceComparer)

  if (healthyInstancesModelLoaded.length > 0) {
    return healthyInstancesModelLoaded[0]
  }

  if (healthyInstances.length > 0) {
    return healthyInstances[0]
  }

  logger.debug('No healthy provider instances found, will attempt to test connection to the best available instance', {
    workspaceId,
    modelProvider,
    modelName,
    availableInstances: modelInstances.length,
    healthyInstances: healthyInstances.length,
    healthyModelLoadedInstances: healthyInstancesModelLoaded.length,
  })

  // run a short test connection check as last ressort
  const planBInstance = modelInstances.length > 0 ? modelInstances[0] : modelProviderInstances[0]

  const response = await requestProviderInstance({
    version: 1,
    requestType: 'testConnection',
    workspaceId,
    connection: planBInstance.connection,
  }).catch(() => null)

  if (response && response.success) {
    return planBInstance
  }

  return null
}
