import jwt from 'jsonwebtoken'

import { prisma } from '@george-ai/pothos-graphql'
import { Context } from '@george-ai/pothos-graphql'

// Authorize GraphQL requests using either a user JWT, or a dev user header (in dev mode).
export const getUserContext = async (getRequestHeader: (key: string) => string | null): Promise<Context> => {
  // Accept JWT for user authentication (for logged-in users)
  const jwtToken = getRequestHeader('x-user-jwt') // request.headers.get('x-user-jwt')
  if (jwtToken) {
    const decoded = jwt.decode(jwtToken) as { sub?: string; preferred_username?: string; email?: string } | null
    if (decoded?.email) {
      const userInformation = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: { id: true, username: true, email: true, profile: true, isAdmin: true },
      })
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

  // DEV ONLY: Use x-dev-user header for GraphQL Playground
  if (process.env.NODE_ENV !== 'production') {
    const devUser = getRequestHeader('x-dev-user') // request.headers.get('x-dev-user')
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
