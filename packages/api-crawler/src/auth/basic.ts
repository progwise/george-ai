/**
 * Basic authentication
 */
import type { AuthConfig } from '../types'

/**
 * Generate Basic authentication headers
 */
export function authenticateBasic(config: AuthConfig): Record<string, string> {
  if (!config.username || !config.password) {
    throw new Error('Username and password are required for basic auth type')
  }

  const credentials = `${config.username}:${config.password}`
  const encoded = Buffer.from(credentials).toString('base64')

  return {
    Authorization: `Basic ${encoded}`,
  }
}
