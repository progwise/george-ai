export const MODEL_PROVIDERS = ['openai', 'ollama'] as const
export type ModelProvider = (typeof MODEL_PROVIDERS)[number]

export interface ProviderConnection {
  baseUrl?: string | null
  apiKey?: string | null
}

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

export const PROVIDER_HEALTH_STATUS = ['healthy', 'degraded', 'unhealthy'] as const
export type ProviderHealthStatus = (typeof PROVIDER_HEALTH_STATUS)[number]
