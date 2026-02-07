import { ApiAuthConfig } from '../api-crawler-config'
import { logger } from '../common'

/**
 * Generate Bearer token authentication headers
 */
export function authenticateBearerToken(config: ApiAuthConfig): Record<string, string> {
  if (!config.token) {
    logger.error('Token is missing in auth config for bearer auth type', { config })
    throw new Error('Token is required for bearer auth type')
  }

  logger.debug('Generating Bearer token auth headers', { config })
  return {
    Authorization: `Bearer ${config.token}`,
  }
}
