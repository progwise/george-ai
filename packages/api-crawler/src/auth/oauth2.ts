/**
 * OAuth2 authentication (Client Credentials flow)
 */
import type { AuthConfig } from '../types'

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

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
  })

  if (config.scope) {
    body.append('scope', config.scope)
  }

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OAuth2 token request failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      throw new Error('OAuth2 response missing access_token')
    }

    return data.access_token
  } catch (error) {
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
