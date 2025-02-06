import { useMatches } from '@tanstack/react-router'
import { User } from '../gql/graphql'

export interface AuthContext {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  user: User | null
  profileUrl?: string
}

export const getInitialAuthContext = (keycloak: {
  authenticated?: boolean
  login: () => void
  logout: () => void
}): AuthContext => {
  return {
    isAuthenticated: !!keycloak.authenticated,
    login: async () => {
      keycloak.login()
    },
    logout: async () => {
      keycloak.logout()
    },
    user: null,
  }
}

export const useAuth = () => {
  const matches = useMatches()
  const foundIndex = matches.findIndex((match) => match.context.auth)
  if (foundIndex === -1) {
    throw new Error('No auth context found in the route hierarchy')
  }
  const auth = matches[foundIndex].context.auth as AuthContext
  return auth
}
