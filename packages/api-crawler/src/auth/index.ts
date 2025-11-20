/**
 * Authentication module
 * Dispatches to appropriate auth method based on type
 */
import type { AuthConfig, AuthType } from '../types'
import { authenticateApiKey } from './api-key'
import { authenticateBasic } from './basic'
import { authenticateBearerToken } from './bearer'
import { authenticateOAuth2 } from './oauth2'

/**
 * Get authentication headers based on auth type
 * Pure function for non-async auth types
 * Async function for OAuth2 (needs to fetch token)
 */
export async function authenticate(authType: AuthType, authConfig: AuthConfig): Promise<Record<string, string>> {
  switch (authType) {
    case 'none':
      return {}

    case 'apiKey':
      return authenticateApiKey(authConfig)

    case 'basic':
      return authenticateBasic(authConfig)

    case 'bearer':
      return authenticateBearerToken(authConfig)

    case 'oauth2':
      return await authenticateOAuth2(authConfig)

    default:
      throw new Error(`Unsupported auth type: ${authType}`)
  }
}

// Re-export individual auth functions for testing
export { authenticateApiKey } from './api-key'
export { authenticateBasic } from './basic'
export { authenticateBearerToken } from './bearer'
export { authenticateOAuth2 } from './oauth2'
