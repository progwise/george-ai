import { ApiAuthConfig } from '../api-crawler-config'
import { logger } from '../common'

/**
 * Generate API key authentication headers
 */
export function authenticateApiKey(config: ApiAuthConfig): Record<string, string> {
  const headerName = config.apiKeyHeader || 'X-API-Key'

  const secureConfig = {
    ...config,
    password: config.password ? '***' : undefined,
    apiKey: config.apiKey ? '***' : undefined,
    apiKeyHeader: config.apiKeyHeader ? '***' : undefined,
    clientSecret: config.clientSecret ? '***' : undefined,
    accessToken: config.accessToken ? '***' : undefined,
    token: config.token ? '***' : undefined,
  }
  logger.debug('Authenticating with API key auth', { config: secureConfig })
  if (!config.apiKey) {
    logger.error('API key is missing in auth config for apiKey auth type', { config: secureConfig })
    throw new Error('API key is required for apiKey auth type')
  }

  logger.debug('Generated API key auth headers', { config: secureConfig, headers: { [headerName]: '***' } })
  return {
    [headerName]: config.apiKey,
  }
}
