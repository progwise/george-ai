import type { ServiceProviderConfig } from '../types'
import { getOllamaModels } from './ollama-api'

/**
 * Discover models from all Ollama providers in the workspace
 * Deduplicates models across multiple instances
 */
export const discoverOllamaModels = async (providers: ServiceProviderConfig[]): Promise<string[]> => {
  const ollamaConfigs = providers.filter((p) => p.provider === 'ollama')

  if (ollamaConfigs.length === 0) {
    return []
  }

  const allModels = new Set<string>()

  // Query each Ollama instance and deduplicate models
  for (const config of ollamaConfigs) {
    for (const endpoint of config.endpoints) {
      if (!endpoint.url) continue

      try {
        const result = await getOllamaModels({ url: endpoint.url, apiKey: endpoint.apiKey })
        result.models.forEach((model) => allModels.add(model.name))
      } catch (error) {
        console.warn(`Failed to get models from Ollama at ${endpoint.url}:`, error)
      }
    }
  }

  return Array.from(allModels)
}
