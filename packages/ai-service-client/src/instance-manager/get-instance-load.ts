import { getOllamaRunningModels } from '../ollama/ollama-api'
import { ServiceProviderType } from '../types'

const TTL_MS = 10 * 1000 // 30 seconds
const instanceLoadCache = new Map<string, { timestamp: number; vramUsageMB: number; runningModels: string[] }>()

export const getInstanceLoad = async (args: {
  provider: ServiceProviderType
  url?: string
  apiKey?: string
  vramGB?: number
}): Promise<{ vramUsageMB: number; runningModels: string[] } | undefined> => {
  const { provider, url, apiKey } = args

  const cacheKey = `${provider}-${url || 'default'}`
  const cachedLoad = instanceLoadCache.get(cacheKey)
  const now = Date.now()
  if (cachedLoad && now - cachedLoad.timestamp < TTL_MS) {
    return {
      vramUsageMB: cachedLoad.vramUsageMB,
      runningModels: cachedLoad.runningModels,
    }
  }

  if (provider === 'openai') {
    // OpenAI does not provide a public API to get instance load
    // Returning -1 to indicate unknown load
    return
  } else if (provider === 'ollama') {
    if (!url) {
      console.error('Ollama URL not provided')
      throw new Error('Ollama URL not provided')
    }
    const runningModels = await getOllamaRunningModels({ url, apiKey })
    const totalLoad = runningModels.models.reduce((total, model) => total + model.size_vram, 0)
    instanceLoadCache.set(cacheKey, {
      timestamp: now,
      vramUsageMB: totalLoad / (1024 * 1024),
      runningModels: runningModels.models.map((model) => model.name),
    })
    return {
      vramUsageMB: totalLoad / (1024 * 1024),
      runningModels: runningModels.models.map((model) => model.name),
    }
  } else {
    throw new Error(`Unsupported provider: ${provider}`)
  }
}
