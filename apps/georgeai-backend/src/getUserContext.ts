import jwt from 'jsonwebtoken'

import {
  Context,
  getLibraryWorkspace,
  getUserById,
  getUserByMail,
  getWorkspaceMembership,
  validateApiKey,
} from '@george-ai/pothos-graphql'

interface TokenProvider {
  jwtToken?: string | null
  bearerToken?: string | null
  workspaceId?: string | null
}

// Authorize GraphQL requests using either a user JWT or API key (Bearer token).
// Priority: JWT first, then Bearer token
export const getUserContext = async (getTokens: () => TokenProvider): Promise<Context> => {
  const { jwtToken, bearerToken, workspaceId: requestedWorkspaceId } = getTokens()

  // Try JWT authentication first
  if (jwtToken) {
    const decoded = jwt.decode(jwtToken) as { sub?: string; preferred_username?: string; email?: string } | null
    if (decoded?.email) {
      const userInformation = await getUserByMail(decoded.email)
      if (!userInformation) {
        return { session: null }
      }

      // Get workspace membership (single efficient query with fallback)
      const membership = await getWorkspaceMembership(userInformation.id, requestedWorkspaceId)

      if (!membership) {
        // User requested a workspace they don't have access to - reject authentication
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
        workspaceId: membership.workspaceId,
        workspaceRole: membership.role,
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
        // For API keys, get workspace from the associated library
        const workspaceId = await getLibraryWorkspace(apiKeyResult.libraryId)

        if (workspaceId) {
          // SECURITY: Verify user is a member of the library's workspace
          const membership = await getWorkspaceMembership(userInformation.id, workspaceId)

          if (!membership) {
            // User is not a member of the library's workspace - unauthorized
            return { session: null }
          }

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
            workspaceId,
            workspaceRole: membership.role,
          }
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
