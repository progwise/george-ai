import jwt from 'jsonwebtoken'

import type { Context } from '@george-ai/pothos-graphql/src/graphql/context'

// This function authorizes incoming GraphQL requests using either an API key, a user JWT, or a dev user header (in dev mode).
export const authorizeGraphQlRequest = async (request: Request): Promise<Context> => {
  // Allow requests with the correct API key (for trusted service-to-service calls)
  const apiKey = request.headers.get('x-api-key')
  if (process.env.GRAPHQL_API_KEY && apiKey === process.env.GRAPHQL_API_KEY) {
    return { session: null }
  }

  // Accept JWT for user authentication (for logged-in users)
  const jwtToken = request.headers.get('x-user-jwt')
  if (jwtToken) {
    const decoded = jwt.decode(jwtToken) as { sub?: string; preferred_username?: string; email?: string } | null
    if (decoded?.sub) {
      return {
        session: {
          user: {
            id: decoded.sub,
            username: decoded.preferred_username ?? decoded.sub,
            email: decoded.email ?? '',
          },
          jwt: jwtToken,
        },
      }
    }
  }

  // DEV ONLY: Allow a fake session if X-Dev-User header is present (for local development/testing)
  if (process.env.NODE_ENV !== 'production') {
    const devUser = request.headers.get('x-dev-user')
    if (devUser) {
      return {
        session: {
          user: {
            id: devUser,
            username: devUser,
            email: `${devUser}@dev.local`,
          },
          jwt: 'dev-jwt',
        },
      }
    }
  }

  return { session: null }
}
