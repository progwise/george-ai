import { Request } from 'express'
import jwt from 'jsonwebtoken'

import { Context, apiKey, user, workspace } from '@george-ai/app-domain'

import { logger } from './common'

interface TokenProvider {
  jwtToken?: string | null
  bearerToken?: string | null
  workspaceId?: string | null
}

export const getUserContextFromExpressRequest = async (request: Request): Promise<Context> => {
  logger.debug('Extracting user context from Express request', {
    headers: request.headers,
    url: request.url,
  })
  return getUserContext(() => ({
    jwtToken: request.headers['x-user-jwt']?.toString() || request.cookies['keycloak-token'] || null,
    bearerToken: request.headers['authorization']?.toString().startsWith('Bearer ')
      ? request.headers['authorization'].toString().substring(7)
      : null,
    workspaceId: request.headers['x-workspace-id']
      ? request.headers['x-workspace-id'].toString()
      : request.cookies['workspace-id'] || null,
  }))
}
// Authorize GraphQL requests using either a user JWT or API key (Bearer token).
// Priority: JWT first, then Bearer token
export const getUserContext = async (getTokens: () => TokenProvider): Promise<Context> => {
  const { jwtToken, bearerToken, workspaceId: requestedWorkspaceId } = getTokens()

  // Try JWT authentication first
  if (jwtToken) {
    const decoded = jwt.decode(jwtToken) as { sub?: string; preferred_username?: string; email?: string } | null
    if (decoded?.email) {
      const userInformation = await user.getUser({ email: decoded.email })
      if (!userInformation) {
        return { session: null, workspaceId: undefined }
      }

      const userProfile = await user.getUserProfile(userInformation.userId)

      // Get workspace membership (single efficient query with fallback)
      const membership = await user.getWorkspaceMembership({
        userId: userInformation.userId,
        workspaceId: requestedWorkspaceId || userInformation.defaultWorkspaceId,
      })

      return {
        session: {
          user: {
            id: userInformation.userId,
            username: userInformation.username,
            email: decoded.email,
            isAdmin: userInformation.isAdmin ?? false,
            defaultWorkspaceId: userInformation.defaultWorkspaceId ?? undefined,
          },
          userProfile: userProfile ?? undefined,
        },
        jwt: jwtToken,
        workspaceId: membership ? membership.workspaceId : undefined,
        workspaceRole: membership ? membership.role : undefined,
      }
    }
  }

  // Try API key authentication if Bearer token is provided
  if (bearerToken) {
    const apiKeyResult = await apiKey.validateApiKey({ apiKey: bearerToken })
    if (apiKeyResult) {
      // Get user information for the API key owner by ID
      const userInformation = await user.getUser({ userId: apiKeyResult.userId })
      if (userInformation) {
        // For API keys, get workspace from the associated library
        const workspaceId = await workspace.getWorkspaceId({ libraryId: apiKeyResult.libraryId })

        if (workspaceId) {
          // SECURITY: Verify user is a member of the library's workspace
          const membership = await user.getWorkspaceMembership({ userId: userInformation.userId, workspaceId })

          if (!membership) {
            // User is not a member of the library's workspace - unauthorized
            return { session: null }
          }

          const userProfile = await user.getUserProfile(userInformation.userId)

          return {
            session: {
              user: {
                id: userInformation.userId,
                username: userInformation.username,
                email: userInformation.email,
                isAdmin: userInformation.isAdmin ?? false,
              },
              userProfile: userProfile ?? undefined,
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
