import { MemoryCalculator } from './memory-calculator.js'
import type { MemoryUsage, OllamaInstance, OllamaModelInfo, OllamaSystemStatus } from './ollama-api-types.js'
import { Semaphore } from './semaphore.js'

class OllamaResourceManager {
  private instances: OllamaInstance[]
  private memoryCalculator: MemoryCalculator
  private semaphores: Map<string, Semaphore> = new Map()
  private modelsInitializedTimestamp: number | null = null

  constructor(instances: OllamaInstance[] = [], safetyBufferGB: number = 2) {
    this.instances = instances.length > 0 ? instances : this.getDefaultInstances()
    this.memoryCalculator = new MemoryCalculator(safetyBufferGB)
    this.ensureAvailableModels()
  }

  private instancesTooOld(): boolean {
    if (!this.modelsInitializedTimestamp) return true
    const age = Date.now() - this.modelsInitializedTimestamp
    return age > 1 * 60 * 1000 // 10 minutes
  }

  private async ensureAvailableModels(): Promise<void> {
    if (!this.instancesTooOld()) return

    await Promise.all(
      this.instances.map(async (instance) => {
        try {
          const response = await fetch(`${instance.url}/api/tags`, {
            headers: instance.apiKey ? { 'X-API-Key': instance.apiKey } : {},
          })

          if (response.ok) {
            const data = (await response.json()) as { models?: Array<{ name: string }> }
            instance.availableModels = data.models?.map((m) => m.name) || []
            console.log(`Loaded ${instance.availableModels.length} models from ${instance.url}`)
          } else {
            instance.availableModels = []
            console.warn(`Failed to load models from ${instance.url}: ${response.status}`)
          }
        } catch (error) {
          instance.availableModels = []
          console.warn(`Error loading models from ${instance.url}:`, error)
        }
      }),
    )

    this.modelsInitializedTimestamp = Date.now()
  }

  public getInstanceList = async () => {
    await this.ensureAvailableModels()
    return this.instances
  }

  private getDefaultInstances(): OllamaInstance[] {
    const baseUrl = process.env.OLLAMA_BASE_URL
    const apiKey = process.env.OLLAMA_API_KEY
    const vramGB = parseInt(process.env.OLLAMA_VRAM_GB || '16', 10)

    if (!baseUrl) {
      throw new Error('OLLAMA_BASE_URL environment variable is not set')
    }

    // Support multiple instances via environment variables
    const instances: OllamaInstance[] = [{ url: baseUrl, apiKey, weight: 1, vramGB }]

    // Check for additional instances (starting from 1, not 2)
    for (let i = 1; i <= 10; i++) {
      const url = process.env[`OLLAMA_BASE_URL_${i}`]
      const key = process.env[`OLLAMA_API_KEY_${i}`]
      const vram = parseInt(process.env[`OLLAMA_VRAM_GB_${i}`] || '16', 10)
      if (url) {
        instances.push({ url, apiKey: key, weight: 1, vramGB: vram })
      }
    }

    return instances
  }

  private async fetchOllamaAPI(instance: OllamaInstance, endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers)
    if (instance.apiKey) {
      headers.set('X-API-Key', instance.apiKey)
    }

    const response = await fetch(`${instance.url}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`OLLAMA API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getSystemStatus(instance: OllamaInstance): Promise<OllamaSystemStatus> {
    return this.fetchOllamaAPI(instance, '/api/ps')
  }

  async getModelInfo(instance: OllamaInstance, modelName: string): Promise<OllamaModelInfo> {
    return this.fetchOllamaAPI(instance, '/api/show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, verbose: true }),
    })
  }

  async calculateMemoryUsage(instance: OllamaInstance): Promise<MemoryUsage> {
    const systemStatus = await this.getSystemStatus(instance)
    return this.memoryCalculator.calculateMemoryUsage(systemStatus, instance)
  }

  async selectBestInstance(modelName?: string): Promise<{ instance: OllamaInstance; concurrency: number }> {
    // Ensure models are loaded
    await this.ensureAvailableModels()

    const instanceAnalysis = await Promise.all(
      this.instances.map(async (instance) => {
        try {
          // If model specified, check if instance has it (using cached data)
          if (modelName && !instance.availableModels?.includes(modelName)) {
            return { instance, memoryUsage: null, load: Infinity, available: false, hasModel: false }
          }

          const memoryUsage = await this.calculateMemoryUsage(instance)
          const load = this.memoryCalculator.calculateLoadScore(memoryUsage)
          return { instance, memoryUsage, load, available: true, hasModel: true }
        } catch (error) {
          console.warn(`OLLAMA instance ${instance.url} unavailable:`, error)
          return { instance, memoryUsage: null, load: Infinity, available: false, hasModel: false }
        }
      }),
    )

    // Filter available instances that have the model (if specified) and sort by load (lower is better)
    const availableInstances = instanceAnalysis
      .filter((analysis) => analysis.available && analysis.memoryUsage && analysis.hasModel)
      .sort((a, b) => a.load - b.load)

    if (availableInstances.length === 0) {
      if (modelName) {
        throw new Error(`No OLLAMA instances available with model: ${modelName}`)
      }
      throw new Error('No OLLAMA instances are available')
    }

    const best = availableInstances[0]
    return {
      instance: best.instance,
      concurrency: best.memoryUsage!.maxConcurrency,
    }
  }

  async getSemaphore(instanceUrl: string): Promise<Semaphore> {
    if (!this.semaphores.has(instanceUrl)) {
      const instance = this.instances.find((inst) => inst.url === instanceUrl)
      if (!instance) {
        throw new Error(`Unknown OLLAMA instance: ${instanceUrl}`)
      }

      const memoryUsage = await this.calculateMemoryUsage(instance)
      const semaphore = new Semaphore(memoryUsage.maxConcurrency)
      this.semaphores.set(instanceUrl, semaphore)

      console.log(
        `Created semaphore for ${instanceUrl}: max concurrency = ${memoryUsage.maxConcurrency} (${Math.round(memoryUsage.safeVRAM / (1024 * 1024 * 1024))}GB available)`,
      )
    }

    return this.semaphores.get(instanceUrl)!
  }

  // Refresh semaphore limits based on current memory usage
  async refreshSemaphore(instanceUrl: string): Promise<void> {
    const instance = this.instances.find((inst) => inst.url === instanceUrl)
    if (!instance) return

    try {
      const memoryUsage = await this.calculateMemoryUsage(instance)
      const currentSemaphore = this.semaphores.get(instanceUrl)

      if (currentSemaphore && currentSemaphore.permitsAvailable() !== memoryUsage.maxConcurrency) {
        // Create new semaphore with updated limits
        const newSemaphore = new Semaphore(memoryUsage.maxConcurrency)
        this.semaphores.set(instanceUrl, newSemaphore)

        console.log(
          `Updated semaphore for ${instanceUrl}: ${currentSemaphore.permitsAvailable()} → ${memoryUsage.maxConcurrency} max concurrency`,
        )
      }
    } catch (error) {
      console.warn(`Failed to refresh semaphore for ${instanceUrl}:`, error)
    }
  }
}

// Export singleton instance
export const ollamaResourceManager = new OllamaResourceManager()
export { OllamaResourceManager }
export type { MemoryUsage, OllamaInstance } from './ollama-api-types.js'
