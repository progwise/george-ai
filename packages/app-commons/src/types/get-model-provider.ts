import { ModelProvider } from './model-provider'

export function getModelProvider(providerString: string): ModelProvider {
  switch (providerString.toLowerCase()) {
    case 'openai':
      return 'openai'
    case 'ollama':
      return 'ollama'
    default:
      throw new Error(`Unknown model provider: ${providerString}`)
  }
}
