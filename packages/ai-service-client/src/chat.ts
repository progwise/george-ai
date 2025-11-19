import { ollamaChat } from './ollama/ollama-chat'
import { openAIChat } from './openAi'
import { providerCache } from './provider-cache'
import { ChatOptions, ServiceProviderType } from './types'

export const chat = async (workspaceId: string, modelProvider: ServiceProviderType, chatOptions: ChatOptions) => {
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
    if (
      providerConfig.endpoints.length === 0 ||
      providerConfig.endpoints.some((ep) => !ep.url || ep.url.length === 0)
    ) {
      throw new Error('No Ollama endpoints provided in the provider configuration')
    }
    return ollamaChat(
      chatOptions,
      providerConfig.endpoints.map((ep) => {
        return {
          url: ep.url!,
          apiKey: ep.apiKey,
          vramGB: ep.vramGB,
          name: ep.name,
        }
      }),
    )
  } else if (providerConfig.provider === 'openai') {
    if (providerConfig.endpoints.length === 0 || !providerConfig.endpoints[0].apiKey) {
      throw new Error('OpenAI API key is not provided in the provider configuration')
    }
    return openAIChat(chatOptions, providerConfig.endpoints[0].apiKey)
  } else {
    throw new Error(`Unsupported chat model provider: ${providerConfig.provider}`)
  }
}
