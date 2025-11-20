/**
 * API Key authentication
 */
import type { AuthConfig } from '../types'

/**
 * Generate API key authentication headers
 */
export function authenticateApiKey(config: AuthConfig): Record<string, string> {
  const headerName = config.apiKeyHeader || 'X-API-Key'

  if (!config.apiKey) {
    throw new Error('API key is required for apiKey auth type')
  }

  return {
    [headerName]: config.apiKey,
  }
}
