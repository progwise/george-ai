import { ApiAuthConfig } from '../api-crawler-config'
import { logger } from '../common'

/**
 * Generate Basic authentication headers
 */
export function authenticateBasic(config: ApiAuthConfig): Record<string, string> {
  if (!config.username || !config.password) {
    logger.error('Username or password is missing in auth config for basic auth type', { config })
    throw new Error('Username and password are required for basic auth type')
  }

  const credentials = `${config.username}:${config.password}`
  const encoded = Buffer.from(credentials).toString('base64')

  logger.debug('Generated Basic auth headers', { config })

  return {
    Authorization: `Basic ${encoded}`,
  }
}
