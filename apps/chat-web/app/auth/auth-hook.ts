import { useQuery, useQueryClient } from '@tanstack/react-query'
import Keycloak from 'keycloak-js'

import { toastError } from '../components/georgeToaster'
import { queryKeys } from '../query-keys'
import { getUserProfile } from '../server-functions/users'
import { ensureBackendUser, getKeycloakConfig } from './auth.server'

export interface CurrentUser {
  id: string
  username: string
  email: string
  name: string
  given_name: string
  family_name: string
  createdAt: string
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
    queryKey: [queryKeys.KeycloakInstance],
    staleTime: Infinity,
    queryFn: async () => {
      const config = await getKeycloakConfig()
      const keycloak = new Keycloak(config)

      if (typeof window !== 'undefined' && !keycloak.didInitialize) {
        await keycloak.init({
          onLoad: 'check-sso',
        })
      }
      keycloak.onAuthSuccess = () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUser] })
      }
      keycloak.onAuthError = (error) => {
        toastError('Keycloak error: ' + error)
      }
      keycloak.onAuthLogout = () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUser] })
      }
      return keycloak
    },
  })

  const { data: currentUser } = useQuery({
    queryKey: [queryKeys.CurrentUser, keycloak, keycloak?.authenticated, keycloak?.token],
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
      return { ...user }
    },
  })

  const { data: currentUserProfile } = useQuery({
    queryKey: [queryKeys.CurrentUserProfile, currentUser?.id],
    enabled: !!currentUser,
    queryFn: async () => {
      if (!currentUser?.id) {
        return null
      }
      const userProfile = await getUserProfile({ data: { userId: currentUser.id } })
      return userProfile
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
      userProfile: null,
    }
  }

  return {
    isAuthenticated: true,
    login: async () => {},
    logout: async () => {
      localStorage.removeItem('google_drive_access_token')
      keycloak.logout()
    },
    user: currentUser,
    userProfile: currentUserProfile?.userProfile,
  }
}
