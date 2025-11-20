/**
 * OAuth2 authentication (Client Credentials flow)
 */
import { createLogger } from '@george-ai/web-utils'

import type { AuthConfig } from '../types'

const logger = createLogger('OAuth2')

/**
 * Fetch OAuth2 access token using client credentials flow
 */
async function fetchAccessToken(config: AuthConfig): Promise<string> {
  if (!config.tokenUrl) {
    throw new Error('Token URL is required for OAuth2')
  }

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Client ID and client secret are required for OAuth2')
  }

  logger.debug('Fetching access token from:', config.tokenUrl)
  logger.debug('Client ID:', config.clientId)

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
  })

  if (config.scope) {
    body.append('scope', config.scope)
    logger.debug('Scope:', config.scope)
  }

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    logger.debug('Token response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Token request failed:', errorText)
      throw new Error(`OAuth2 token request failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    logger.debug('Token response keys:', Object.keys(data))

    if (!data.access_token) {
      logger.error('Response missing access_token. Response:', data)
      throw new Error('OAuth2 response missing access_token')
    }

    logger.debug('Access token received successfully')
    return data.access_token
  } catch (error) {
    logger.error('Authentication error:', error)
    if (error instanceof Error) {
      throw new Error(`OAuth2 authentication failed: ${error.message}`)
    }
    throw new Error('OAuth2 authentication failed')
  }
}

/**
 * Generate OAuth2 authentication headers
 * If accessToken is already provided, use it directly
 * Otherwise, fetch a new token using client credentials
 */
export async function authenticateOAuth2(config: AuthConfig): Promise<Record<string, string>> {
  // If access token is already provided, use it
  if (config.accessToken) {
    return {
      Authorization: `Bearer ${config.accessToken}`,
    }
  }

  // Otherwise, fetch new token
  const accessToken = await fetchAccessToken(config)

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}
