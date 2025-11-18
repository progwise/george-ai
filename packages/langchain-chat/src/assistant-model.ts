import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai'

import { getProviders, type ServiceProviderType } from '@george-ai/ai-service-client'

export type AssistantModel = ChatOllama | ChatOpenAI<ChatOpenAICallOptions>
// BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>

export const getModel = async (workspaceId: string, modelProvider: ServiceProviderType, modelName: string) => {
  // Get workspace providers from cache (with auto-refresh)
  const allProviders = await getProviders(workspaceId)

  // Find the provider config for the requested provider type
  const providerConfig = allProviders.find((p) => p.provider === modelProvider)
  if (!providerConfig) {
    throw new Error(
      `No ${modelProvider} provider configured for workspace ${workspaceId}. Please configure providers in admin settings.`,
    )
  }

  if (modelProvider === 'ollama') {
    if (
      providerConfig.endpoints.length === 0 ||
      providerConfig.endpoints.some((ep) => !ep.url || ep.url.length === 0)
    ) {
      throw new Error('No Ollama endpoints provided in the provider configuration')
    }
    const endpoint = providerConfig.endpoints[0] // Use first endpoint for LangChain model
    return new ChatOllama({
      model: modelName,
      baseUrl: endpoint.url!,
      headers: endpoint.apiKey ? { Authorization: `Bearer ${endpoint.apiKey}` } : undefined,
    })
  } else if (modelProvider === 'openai') {
    if (providerConfig.endpoints.length === 0 || !providerConfig.endpoints[0].apiKey) {
      throw new Error('OpenAI API key is not provided in the provider configuration')
    }
    return new ChatOpenAI({
      modelName: modelName,
      apiKey: providerConfig.endpoints[0].apiKey,
    })
  } else {
    throw new Error(`Unsupported model provider: ${modelProvider}`)
  }
}
