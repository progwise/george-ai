import jwt from 'jsonwebtoken'

import { prisma } from '@george-ai/pothos-graphql'
import { Context } from '@george-ai/pothos-graphql'

// Authorize GraphQL requests using either a user JWT, or a dev user header (in dev mode).
export const authorizeGraphQlRequest = async (request: Request): Promise<Context> => {
  // Accept JWT for user authentication (for logged-in users)
  const jwtToken = request.headers.get('x-user-jwt')
  if (jwtToken) {
    const decoded = jwt.decode(jwtToken) as { sub?: string; preferred_username?: string; email?: string } | null
    if (decoded?.sub) {
      const userProfileResult = await prisma.userProfile.findUnique({ where: { userId: decoded.sub } })

      return {
        session: {
          user: {
            id: decoded.sub,
            username: decoded.preferred_username ?? decoded.sub,
            email: decoded.email ?? '',
          },
          userProfile: userProfileResult ?? undefined,
          jwt: jwtToken,
        },
      }
    }
  }

  // DEV ONLY: Use x-dev-user header for GraphQL Playground
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
