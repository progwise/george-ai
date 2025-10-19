import jwt from 'jsonwebtoken'

import { Context, getUserById, getUserByMail, validateApiKey } from '@george-ai/pothos-graphql'

interface TokenProvider {
  jwtToken?: string | null
  bearerToken?: string | null
}

// Authorize GraphQL requests using either a user JWT or API key (Bearer token).
// Priority: JWT first, then Bearer token
export const getUserContext = async (getTokens: () => TokenProvider): Promise<Context> => {
  const { jwtToken, bearerToken } = getTokens()

  // Try JWT authentication first
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
        },
        jwt: jwtToken,
      }
    }
  }

  // Try API key authentication if Bearer token is provided
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

  return { session: null }
}
