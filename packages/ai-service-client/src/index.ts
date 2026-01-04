import { discoverOllamaModels } from './ollama/ollama-discover'
import { clearAllOllamaResourceManagers, invalidateOllamaResourceManager } from './ollama/ollama-resource-manager'
import { discoverOpenAIModels } from './openAi/openai-discover'
// Workspace provider cache management
import { providerCache } from './provider-cache'
import type { ServiceProviderConfig, ServiceProviderType } from './types'

export { getChunkVectors } from './instance-manager'

export { getEmbedding } from './embed'
export { chat } from './chat'
export type { AIResponse, Message, ServiceProviderConfig, ServiceProviderType } from './types'
export {
  isChatModel,
  isEmbeddingModel,
  isVisionModel,
  getCapabilitiesForModel,
  classifyModel,
} from './model-classifier'

export {
  getOllamaClusterStatus,
  getOllamaResourceManager,
  invalidateOllamaResourceManager,
  clearAllOllamaResourceManagers,
  testOllamaConnection,
} from './ollama'

export { testOpenAIConnection } from './openAi'
/**
 * Discover models from a specific provider type for a workspace
 * Queries the workspace's configured providers and returns available model names
 *
 * @param workspaceId - The workspace ID to discover models for
 * @param provider - The provider type to query ('ollama' or 'openai')
 * @returns Array of model names available from the provider
 */
export const discoverModels = async (workspaceId: string, provider: ServiceProviderType): Promise<string[]> => {
  const providers = await providerCache.getProviders(workspaceId)

  if (provider === 'ollama') {
    return discoverOllamaModels(providers)
  } else if (provider === 'openai') {
    return discoverOpenAIModels(providers)
  }

  return []
}

/**
 * Initialize workspace provider loading
 * Must be called once on application startup
 *
 * @param loader - Function that fetches providers for a workspace from database
 * @param options - Cache configuration (ttl, maxSize)
 */
export const initializeWorkspace = (
  loader: (workspaceId: string) => Promise<ServiceProviderConfig[]>,
  options?: { ttl?: number; maxSize?: number },
) => {
  providerCache.initialize(loader, options)
}

/**
 * Get providers for a workspace (with auto-refresh from cache)
 * Used internally by chat() and getEmbedding()
 *
 * @param workspaceId - The workspace ID to get providers for
 * @returns Array of provider configurations for the workspace
 */
export const getProviders = async (workspaceId: string): Promise<ServiceProviderConfig[]> => {
  return providerCache.getProviders(workspaceId)
}

/**
 * Invalidate cached providers for a workspace
 * Call this when admin updates provider configurations
 */
export const invalidateWorkspace = (workspaceId: string) => {
  providerCache.invalidate(workspaceId)
  invalidateOllamaResourceManager(workspaceId)
}

/**
 * Clear all workspace caches
 */
export const clearAllWorkspaceCache = () => {
  providerCache.clearAll()
  clearAllOllamaResourceManagers()
}

/**
 * Get cache statistics for monitoring
 */
export const getWorkspaceCacheStats = () => {
  return providerCache.getStats()
}

export * as instanceManager from './instance-manager'
