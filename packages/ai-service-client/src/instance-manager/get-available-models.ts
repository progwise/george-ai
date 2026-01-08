import { DiscoveredModel, getOllamaModels } from '../ollama'
import { getOpenAIModels } from '../openAi'
import { ServiceProviderType } from '../types'
import { logger } from './common'

export const getAvailableModels = async (args: {
  provider: ServiceProviderType
  url?: string
  apiKey?: string
}): Promise<Array<DiscoveredModel>> => {
  const { provider, url, apiKey } = args

  switch (provider) {
    case 'ollama':
      if (!url) {
        logger.error('Ollama URL not provided')
        throw new Error('Ollama URL not provided')
      } else {
        const response = await getOllamaModels({ url, apiKey })
        return response.models
      }
    case 'openai':
      if (!apiKey) {
        logger.error('OpenAI API key not provided')
        throw new Error('OpenAI API key not provided')
      } else {
        const response = await getOpenAIModels({ url: 'https://api.openai.com/v1', apiKey })
        return response.data
      }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
