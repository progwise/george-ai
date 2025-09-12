import { getErrorObject, getErrorString } from '@george-ai/web-utils'

import { isEmbeddingModel, isVisionModel } from './model-classifier.js'
import {
  OllamaModel,
  OllamaRunningModel,
  getOllamaModels,
  getOllamaRunningModels,
  getOllamaVersion,
  unloadOllamaModel,
} from './ollama-api.js'
import { Semaphore } from './semaphore.js'

interface OllamaInstanceConfiguration {
  url: string
  apiKey?: string
  vramGB: number // Total VRAM in GB
}

export function getInstanceConfigurations(): OllamaInstanceConfiguration[] {
  const baseUrl = process.env.OLLAMA_BASE_URL
  const apiKey = process.env.OLLAMA_API_KEY
  const vramGB = parseInt(process.env.OLLAMA_VRAM_GB || '16', 10)

  if (!baseUrl) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }

  // Support multiple instances via environment variables
  const instances = [{ url: baseUrl, apiKey, vramGB }]

  // Check for additional instances (starting from 1, not 2)
  for (let i = 1; i <= 10; i++) {
    const url = process.env[`OLLAMA_BASE_URL_${i}`]
    const key = process.env[`OLLAMA_API_KEY_${i}`]
    const vram = parseInt(process.env[`OLLAMA_VRAM_GB_${i}`] || '16', 10)
    if (url) {
      instances.push({ url, apiKey: key, vramGB: vram })
    }
  }

  return instances
}

type OllamaInstance = {
  name: string
  config: OllamaInstanceConfiguration
  status: { timestamp: number; isOnline: boolean; ollamaVersion?: string; error?: object }
  models: { timestamp: number; models: OllamaModel[] } | null
  load: { timestamp: number; models: OllamaRunningModel[]; totalVramUsage: number } | null
  semaphores: Map<string, Semaphore> // Keyed by model name
}

class OllamaResourceManager {
  private instances: Record<string, OllamaInstance> = {} // Keyed by instance URL

  constructor() {}

  public async init() {
    this.instances = {}
    const instancePromises = getInstanceConfigurations().map(async (config, index) => {
      const status = await this.getInstanceStatus(config)
      const instance: OllamaInstance = {
        name: `ollama-${index}`,
        config,
        status,
        semaphores: new Map(),
        models: null,
        load: null,
      }
      if (status.isOnline) {
        instance.models = await getOllamaModels(config)
      }
      this.instances[config.url] = instance
    })
    await Promise.all(instancePromises)
    console.log(`Initialized ${Object.keys(this.instances).length} OLLAMA instances`)
  }

  async getAvailableModelNames(): Promise<string[]> {
    const allModelNames = await Promise.all(
      Object.values(this.instances).map(async (instance) => {
        await this.updateInstanceModels(instance.config.url)
        if (instance.status.isOnline && instance.models) {
          return instance.models.models.map((m) => m.name)
        }
        return []
      }),
    )

    return Array.from(new Set(allModelNames.flat()))
  }

  public async getAllInstances(): Promise<OllamaInstance[]> {
    // Ensure all instances are initialized
    Object.keys(this.instances).map(async (url) => {
      await this.updateInstanceStatus(url)
      await this.updateInstanceModels(url)
      await this.updateInstanceLoad(url)
    })
    return Object.values(this.instances)
  }

  private async getInstanceStatus(args: {
    url: string
    apiKey?: string
  }): Promise<{ timestamp: number; isOnline: boolean; ollamaVersion?: string; error?: object }> {
    try {
      const versionInfo = await getOllamaVersion(args)
      return {
        timestamp: versionInfo.timestamp,
        isOnline: true,
        ollamaVersion: versionInfo.version,
      }
    } catch (error) {
      console.warn(
        `❌ OLLAMA instance ${args.url} is offline or unreachable:`,
        error instanceof Error ? error.message : 'Unknown error',
      )
      return {
        timestamp: Date.now(),
        isOnline: false,
        error: getErrorObject(error),
      }
    }
  }

  private async updateInstanceStatus(url: string) {
    const instance = this.instances[url]
    if (!instance) throw new Error(`Instance not found: ${url}`)

    if (instance.status && Date.now() - instance.status.timestamp < 10000) {
      // If status was updated less than 60 seconds ago, skip
      return instance.status
    }

    const status = await this.getInstanceStatus(instance.config)
    return (instance.status = status)
  }

  private async updateInstanceModels(url: string) {
    const instance = this.instances[url]
    if (!instance) throw new Error(`Instance not found: ${url}`)
    if (!instance.status.isOnline) {
      // If instance is offline, clear models
      instance.models = null
      return null
    }

    if (instance.models && Date.now() - instance.models.timestamp < 300000) {
      // If models were updated less than 5 minutes ago, skip
      return instance.models
    }

    try {
      const models = await getOllamaModels(instance.config)
      return (instance.models = models)
    } catch (error) {
      console.warn(`Failed to update models for OLLAMA instance ${instance.config.url}:`, error)
      return (instance.models = null)
    }
  }

  private async updateInstanceLoad(url: string) {
    const instance = this.instances[url]
    if (!instance) throw new Error(`Instance not found: ${url}`)

    if (instance.load && Date.now() - instance.load.timestamp < 60000) {
      // If load was updated less than 60 seconds ago, skip
      return instance.load
    }

    if (!instance.status.isOnline) {
      // If instance is offline, clear load
      instance.load = null
      return null
    }

    try {
      const runningModels = await getOllamaRunningModels(instance.config)
      instance.load = {
        ...runningModels,
        totalVramUsage: runningModels.models.map((model) => model.size_vram).reduce((sum, m) => sum + m, 0),
      }
      return instance.load
    } catch (error) {
      console.warn(`Failed to update load for OLLAMA instance ${instance.config.url}:`, error)
      return (instance.load = null)
    }
  }

  async unloadModel(instance: OllamaInstance, modelName: string): Promise<{ success: boolean; reason?: string }> {
    if (!instance.status.isOnline) {
      return { success: false, reason: 'Instance is offline' }
    }

    if (!instance.load || !instance.load.models.some((m) => m.name === modelName)) {
      return { success: true, reason: 'Model not loaded' } // Model is not loaded
    }
    try {
      const result = await unloadOllamaModel(instance.config, modelName)
      if (result.done) {
        return { success: true }
      } else {
        return { success: false, reason: 'Unload not completed' }
      }
    } catch (error) {
      return { success: false, reason: getErrorString(error) || 'Unknown error' }
    }
  }

  async getBestInstance(model: string): Promise<{ instance: OllamaInstance; semaphore: Semaphore }> {
    // Refresh status, models, and load for all instances
    const updatePromises = Object.keys(this.instances).map(async (url) => {
      await this.updateInstanceStatus(url)
      await this.updateInstanceModels(url)
      await this.updateInstanceLoad(url)
    })
    await Promise.all(updatePromises)

    // Filter to only online instances that support the requested model
    const availableInstances = Object.values(this.instances).filter(
      (inst) => inst.status.isOnline && inst.models && inst.models.models.some((m) => m.name === model) && inst.load, // Ensure load info is available
    )

    if (availableInstances.length === 0) {
      console.warn(`No available OLLAMA instances support model: ${model}`)
      throw new Error(`No available OLLAMA instances support model: ${model}`)
    }

    // Calculate memory usage and load score for each instance
    const scoredInstances = availableInstances.map((inst) => {
      const usedVram = inst.load!.totalVramUsage
      const modelSize = inst.models!.models.find((m) => m.name === model)?.size || 0
      const isModelLoaded = inst.load!.models.some((m) => m.name === model)
      const configuredVram = inst.config.vramGB * 1024 * 1024 * 1024
      const availableVramWithModelLoaded = configuredVram - usedVram - (isModelLoaded ? 0 : modelSize)
      const safeMemory = configuredVram * 0.1

      const sizePerRequest = this.getEstimatedSizePerRequest(model)
      const maxConcurrency = Math.max(1, Math.floor((availableVramWithModelLoaded - safeMemory) / sizePerRequest))
      const semaphore = inst.semaphores.get(model) || new Semaphore(maxConcurrency)

      return { instance: inst, memory: { usedVram, modelSize, isModelLoaded, configuredVram }, semaphore }
    })

    // Prefer instances that less waiting on semaphore
    scoredInstances.sort((a, b) => {
      const aWaiting = a.semaphore ? a.semaphore.queueLength() : 0
      const bWaiting = b.semaphore ? b.semaphore.queueLength() : 0
      if (aWaiting !== bWaiting) {
        return aWaiting - bWaiting // Fewer waiting first
      }

      // Then prefer instances with more available VRAM after model loaded
      const aAvailableVram =
        a.memory.configuredVram - a.memory.usedVram - (a.memory.isModelLoaded ? 0 : a.memory.modelSize)
      const bAvailableVram =
        b.memory.configuredVram - b.memory.usedVram - (b.memory.isModelLoaded ? 0 : b.memory.modelSize)
      return bAvailableVram - aAvailableVram // More available VRAM first
    })

    return scoredInstances[0]
  }

  getEstimatedSizePerRequest(modelName: string) {
    const sizePerRequest = isVisionModel(modelName)
      ? 1024 * 1024 * 100
      : isEmbeddingModel(modelName)
        ? 1024 * 1024 * 5
        : 1024 * 1024 * 50
    return sizePerRequest
  }

  // Refresh semaphore limits based on current memory usage
  async refreshSemaphore(instanceUrl: string, modelName: string): Promise<void> {
    const instance = this.instances[instanceUrl]
    if (!instance) throw new Error(`Instance not found: ${instanceUrl}`)
    const model = instance.models?.models.find((m) => m.name === modelName)
    if (!model) throw new Error(`Model not found on instance ${instanceUrl}: ${model}`)

    await Promise.all([
      this.updateInstanceStatus(instanceUrl),
      this.updateInstanceModels(instanceUrl),
      this.updateInstanceLoad(instanceUrl),
    ])

    if (!instance.status.isOnline || !instance.models || !instance.load) {
      console.warn(`Cannot refresh semaphore for offline or uninitialized instance: ${instanceUrl}`)
      return
    }
  }
}

// Export singleton instance
export const ollamaResourceManager = new OllamaResourceManager()
ollamaResourceManager
  .init()
  .catch((error) => {
    console.error('Failed to initialize OllamaResourceManager:', error)
  })
  .then(() => {
    console.log('OllamaResourceManager initialized')
    console.log('Available models:', ollamaResourceManager.getAvailableModelNames())
    console.log('Instances:', ollamaResourceManager.getAllInstances())
  })
