import { getOllamaModels } from '../ollama'
import { getOpenAIModels } from '../openAi'
import { InstanceStatus } from '../types'

export const getInstanceStatus = async (params: {
  provider: 'ollama' | 'openai'
  url?: string
  apiKey?: string
}): Promise<InstanceStatus> => {
  try {
    switch (params.provider) {
      case 'ollama':
        if (!params.url) {
          throw new Error('Ollama URL not provided')
        }
        await getOllamaModels({ url: params.url, apiKey: params.apiKey })
        break
      case 'openai':
        if (!params.apiKey) {
          throw new Error('OpenAI API key not provided')
        }
        await getOpenAIModels({ url: 'https://api.openai.com/v1', apiKey: params.apiKey })
        break
      default:
        throw new Error(`Unsupported provider: ${params.provider}`)
    }
    return 'online'
  } catch (error) {
    console.warn(`Instance status check failed for provider ${params.provider}:`, error)
    return 'offline'
  }
}
