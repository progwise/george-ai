/**
 * Bearer token authentication
 */
import type { AuthConfig } from '../types'

/**
 * Generate Bearer token authentication headers
 */
export function authenticateBearerToken(config: AuthConfig): Record<string, string> {
  if (!config.token) {
    throw new Error('Token is required for bearer auth type')
  }

  return {
    Authorization: `Bearer ${config.token}`,
  }
}
