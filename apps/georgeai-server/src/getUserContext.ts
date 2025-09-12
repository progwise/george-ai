import jwt from 'jsonwebtoken'

import { Context, getUserByMail } from '@george-ai/pothos-graphql'

// Authorize GraphQL requests using either a user JWT, or a dev user header (in dev mode).
export const getUserContext = async (getToken: () => string | null): Promise<Context> => {
  // Accept JWT for user authentication (for logged-in users)
  const jwtToken = getToken() // request.headers.get('x-user-jwt')
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

  return { session: null }
}
