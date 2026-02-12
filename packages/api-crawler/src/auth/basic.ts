import { ApiAuthConfig } from '../api-crawler-config'
import { logger } from '../common'

/**
 * Generate Basic authentication headers
 */
export function authenticateBasic(config: ApiAuthConfig): Record<string, string> {
  const secureConfig = {
    ...config,
    password: config.password ? '***' : undefined,
    apiKey: config.apiKey ? '***' : undefined,
    apiKeyHeader: config.apiKeyHeader ? '***' : undefined,
    clientSecret: config.clientSecret ? '***' : undefined,
    accessToken: config.accessToken ? '***' : undefined,
    token: config.token ? '***' : undefined,
  }
  logger.debug('Authenticating with Basic auth', { config: secureConfig })
  if (!config.username || !config.password) {
    logger.error('Username or password is missing in auth config for basic auth type', { config: secureConfig })
    throw new Error('Username and password are required for basic auth type')
  }

  const credentials = `${config.username}:${config.password}`
  const encoded = Buffer.from(credentials).toString('base64')

  logger.debug('Generated Basic auth headers', {
    config: secureConfig,
    headers: {
      Authorization: `Basic XXX`, // Do not log actual encoded credentials
    },
  })

  return {
    Authorization: `Basic ${encoded}`,
  }
}
