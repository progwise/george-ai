/**
 * Shopware 6 OAuth2 Authentication
 *
 * Uses OAuth2 client_credentials flow to obtain access tokens
 * Consistent with api-crawler/src/auth/oauth2.ts implementation
 */

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface AuthCredentials {
  clientId: string
  clientSecret: string
}

/**
 * Obtain an access token using OAuth2 client_credentials flow
 */
export async function getAccessToken(baseUrl: string, credentials: AuthCredentials): Promise<string> {
  const base = baseUrl.replace(/\/$/, '')
  const tokenUrl = `${base}/api/oauth/token`

  // Use form-urlencoded as per Shopware 6 API and existing api-crawler implementation
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to obtain access token: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as TokenResponse

  if (!data.access_token) {
    throw new Error('OAuth2 response missing access_token')
  }

  return data.access_token
}
