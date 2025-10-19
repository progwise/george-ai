import jwt from 'jsonwebtoken'

import { Context, getUserById, getUserByMail, validateApiKey } from '@george-ai/pothos-graphql'

interface GetUserContextOptions {
  getJwtToken: () => string | null
  getBearerToken?: () => string | null
}

// Authorize GraphQL requests using either a user JWT, API key, or a dev user header (in dev mode).
export const getUserContext = async (options: GetUserContextOptions | (() => string | null)): Promise<Context> => {
  // Support legacy single-function signature for backward compatibility
  const getJwtToken = typeof options === 'function' ? options : options.getJwtToken
  const getBearerToken = typeof options === 'function' ? undefined : options.getBearerToken

  // Try JWT authentication first
  const jwtToken = getJwtToken()
  if (jwtToken) {
    const decoded = jwt.decode(jwtToken) as { sub?: string; preferred_username?: string; email?: string } | null
    if (decoded?.email) {
      const userInformation = await getUserByMail(decoded.email)
      if (!userInformation) {
        return { session: null }
      }
      return {
        session: {
          user: {
            id: userInformation.id,
            username: userInformation.username,
            email: decoded.email,
            isAdmin: userInformation.isAdmin ?? false,
          },
          userProfile: userInformation.profile ?? undefined,
          jwt: jwtToken,
        },
      }
    }
  }

  // Try API key authentication if Bearer token is provided
  if (getBearerToken) {
    const bearerToken = getBearerToken()
    if (bearerToken) {
      const apiKeyResult = await validateApiKey(bearerToken)
      if (apiKeyResult) {
        // Get user information for the API key owner by ID
        const userInformation = await getUserById(apiKeyResult.userId)
        if (userInformation) {
          return {
            session: {
              user: {
                id: userInformation.id,
                username: userInformation.username,
                email: userInformation.email,
                isAdmin: userInformation.isAdmin ?? false,
              },
              userProfile: userInformation.profile ?? undefined,
              jwt: '', // No JWT for API key auth
            },
            apiKey: apiKeyResult,
          }
        }
        // If we can't find the user by ID, still return the API key context
        return {
          session: null,
          apiKey: apiKeyResult,
        }
      }
    }
  }

  return { session: null }
}
