import { getOllamaEmbedding } from './ollama'
import { getOpenAIEmbedding } from './openAi'
import { providerCache } from './provider-cache'
import type { ServiceProviderType } from './types'

export const getEmbedding = async (
  workspaceId: string,
  modelProvider: ServiceProviderType,
  modelName: string,
  question: string,
) => {
  // Get workspace providers from cache (with auto-refresh)
  const allProviders = await providerCache.getProviders(workspaceId)

  // Find the provider config for the requested provider type
  const providerConfig = allProviders.find((p) => p.provider === modelProvider)
  if (!providerConfig) {
    throw new Error(
      `No ${modelProvider} provider configured for workspace ${workspaceId}. Please configure providers in admin settings.`,
    )
  }

  if (providerConfig.provider === 'ollama') {
    // Ollama embedding now uses workspace resource manager
    return getOllamaEmbedding(workspaceId, modelName, question)
  } else if (providerConfig.provider === 'openai') {
    if (providerConfig.endpoints.length === 0 || !providerConfig.endpoints[0].apiKey) {
      throw new Error('OpenAI API key is not provided in the provider configuration')
    }
    return getOpenAIEmbedding(modelName, question, providerConfig.endpoints[0].apiKey)
  } else {
    throw new Error(`Unsupported embedding model provider: ${providerConfig.provider}`)
  }
}
