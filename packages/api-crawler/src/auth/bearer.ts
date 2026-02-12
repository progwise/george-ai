import { ApiAuthConfig } from '../api-crawler-config'
import { logger } from '../common'

/**
 * Generate Bearer token authentication headers
 */
export function authenticateBearerToken(config: ApiAuthConfig): Record<string, string> {
  const secureConfig = {
    ...config,
    password: config.password ? '***' : undefined,
    apiKey: config.apiKey ? '***' : undefined,
    apiKeyHeader: config.apiKeyHeader ? '***' : undefined,
    clientSecret: config.clientSecret ? '***' : undefined,
    accessToken: config.accessToken ? '***' : undefined,
    token: config.token ? '***' : undefined,
  }
  logger.debug('Authenticating with Bearer token auth', { config: secureConfig })
  if (!config.token) {
    logger.error('Token is missing in auth config for bearer auth type', { config: secureConfig })
    throw new Error('Token is required for bearer auth type')
  }

  logger.debug('Generating Bearer token auth headers', {
    config: secureConfig,
    headers: { Authorization: 'Bearer XXX' },
  })
  return {
    Authorization: `Bearer ${config.token}`,
  }
}
