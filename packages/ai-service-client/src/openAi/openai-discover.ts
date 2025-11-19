import type { ServiceProviderConfig } from '../types'
import { getOpenAIModels } from './openai-api'

/**
 * Discover models from OpenAI provider in the workspace
 */
export const discoverOpenAIModels = async (providers: ServiceProviderConfig[]): Promise<string[]> => {
  const openaiConfig = providers.find((p) => p.provider === 'openai')

  if (!openaiConfig || openaiConfig.endpoints.length === 0) {
    return []
  }

  const endpoint = openaiConfig.endpoints[0]
  if (!endpoint.apiKey) {
    throw new Error('OpenAI API key is required')
  }

  try {
    const result = await getOpenAIModels({
      url: endpoint.url || 'https://api.openai.com/v1',
      apiKey: endpoint.apiKey,
    })
    return result.data.map((model) => model.id)
  } catch (error) {
    console.warn('Failed to get models from OpenAI:', error)
    return []
  }
}
