import { ApiAuthConfig } from '../api-crawler-config'
import { logger } from '../common'

/**
 * Generate API key authentication headers
 */
export function authenticateApiKey(config: ApiAuthConfig): Record<string, string> {
  const headerName = config.apiKeyHeader || 'X-API-Key'

  if (!config.apiKey) {
    logger.error('API key is missing in auth config for apiKey auth type', { config })
    throw new Error('API key is required for apiKey auth type')
  }

  logger.debug('Generated API key auth headers', { config })
  return {
    [headerName]: config.apiKey,
  }
}
