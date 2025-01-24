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
  const auth = matches[0].context.auth as AuthContext

  return auth
}
