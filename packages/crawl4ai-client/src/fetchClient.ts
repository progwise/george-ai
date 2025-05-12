import createClient, { Middleware } from 'openapi-fetch'

import type { paths } from './generated/schema'

const CRAWL4AI_BASE_URL = 'http://gai-crawl4ai:11235'

const clientUnauthorized = createClient<paths>({
  baseUrl: CRAWL4AI_BASE_URL,
})

export const getCrawl4AiToken = async () => {
  const tokenResponse = await clientUnauthorized.POST('/token', {
    body: { email: 'dev@progwise.net' },
  })

  return tokenResponse.data as {
    email: string
    access_token: string
    token_type: string
  }
}

const authMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    const tokenResponse = await clientUnauthorized.POST('/token', {
      body: { email: 'dev@progwise.net' },
    })

    if (!tokenResponse.data) {
      throw new Error('Failed to get token')
    }

    const { access_token: accessToken } = tokenResponse.data as {
      email: string
      access_token: string
      token_type: string
    }

    request.headers.append('Authorization', `Bearer ${accessToken}`)
  },
}

export const client = createClient<paths>({ baseUrl: CRAWL4AI_BASE_URL })
client.use(authMiddleware)
