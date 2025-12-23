import { getCapabilitiesForModel } from '../model-classifier'
import { getOllamaResourceManager } from './ollama-resource-manager'

export const getClusterStatus = async (workspaceId: string) => {
  const manager = getOllamaResourceManager(workspaceId)
  const instances = await manager.getAllInstances()

  return {
    instances: instances.map((instance) => ({
      name: instance.name,
      url: instance.config.url,
      type: 'OLLAMA',
      isOnline: instance.status.isOnline,
      version: 'OLLAMA ' + instance.status.ollamaVersion,
      availableModels: instance.models?.models.map((model) => ({
        name: model.name,
        size: model.size,
        digest: model.digest,
        parameterSize: model.details?.parameter_size,
        quantizationLevel: model.details?.quantization_level,
        family: model.details?.family,
        capabilities: getCapabilitiesForModel(model.name),
      })),
      runningModels: instance.load?.models.map((model) => ({
        name: model.name,
        size: model.size,
        expiresAt: model.expires_at,
        activeRequests: instance.semaphores.get(model.name)?.queueLength() || 0,
      })),
      modelQueues: Array.from(instance.semaphores).map(([modelName, semaphore]) => ({
        modelName,
        queueLength: semaphore.queueLength(),
        maxConcurrency: semaphore.permitsAvailable() + semaphore.queueLength(),
        estimatedRequestSize: manager.getEstimatedSizePerRequest(modelName),
      })),
      totalVram: instance.config.vramGB * 1024 * 1024 * 1024,
      usedVram: instance.load?.totalVramUsage || 0,
    })),
    totalInstances: instances.length,
    availableInstances: instances.filter((i) => i.status.isOnline).length,
    healthyInstances: instances.filter((i) => i.status.isOnline && !i.status.error).length,
    totalMemory: instances.reduce((sum, inst) => sum + (inst.config.vramGB * 1024 * 1014 * 1024 || 0), 0),
    totalUsedMemory: instances.reduce((sum, inst) => sum + (inst.load?.totalVramUsage || 0), 0),
    totalQueueLength: instances.reduce((sum, inst) => {
      return (
        sum + Array.from(inst.semaphores).reduce((modelSum, [, semaphore]) => modelSum + semaphore.queueLength(), 0)
      )
    }, 0),
    totalMaxConcurrency: instances.reduce((sum, inst) => {
      return (
        sum +
        Array.from(inst.semaphores).reduce(
          (modelSum, [, semaphore]) => modelSum + semaphore.permitsAvailable() + semaphore.queueLength(),
          0,
        )
      )
    }, 0),
  }
}
