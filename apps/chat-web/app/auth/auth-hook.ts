import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ensureBackendUser, getKeycloakConfig } from './auth.server'
import Keycloak from 'keycloak-js'
import { queryKeys } from '../query-keys'

export interface CurrentUser {
  id: string
  username: string
  email: string
  name: string
  given_name: string
  family_name: string
  createdAt: string
  profileUrl: string
}

export interface AuthContext {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  user: CurrentUser | null
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { data: keycloak, isLoading: keycloakIsLoading } = useQuery({
    queryKey: ['keycloak'],
    staleTime: Infinity,
    queryFn: async () => {
      const config = await getKeycloakConfig()
      const keycloak = new Keycloak(config)

      if (typeof window !== 'undefined' && !keycloak.didInitialize) {
        keycloak.init({
          onLoad: 'check-sso',
        })
      }
      keycloak.onAuthSuccess = () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUser] })
      }
      keycloak.onAuthError = (error) => {
        alert('Keycloak error: ' + error)
      }
      keycloak.onAuthLogout = () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUser] })
      }
      return keycloak
    },
  })

  const { data: currentUser } = useQuery({
    queryKey: [
      queryKeys.CurrentUser,
      keycloak,
      keycloak?.authenticated,
      keycloak?.token,
    ],
    staleTime: Infinity,
    enabled: !!keycloak && !keycloakIsLoading,
    queryFn: async () => {
      if (!keycloak) {
        return null
      }
      if (!keycloak.authenticated) {
        return null
      }
      const token = keycloak.token
      if (!token) {
        return null
      }
      const { login: user } = await ensureBackendUser({ data: token })
      return { ...user, profileUrl: keycloak.createAccountUrl() }
    },
  })

  if (!keycloak) {
    return {
      isAuthenticated: false,
      login: async () => {},
      logout: async () => {},
      user: null,
    }
  }

  if (!currentUser) {
    return {
      isAuthenticated: false,
      login: async () => {
        keycloak.login()
      },
      logout: async () => {},
      user: null,
    }
  }

  return {
    isAuthenticated: true,
    login: async () => {},
    logout: async () => {
      keycloak.logout()
      queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUser] })
    },
    user: currentUser,
  }
}
