import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import Keycloak from 'keycloak-js'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toastError, toastSuccess } from '../components/georgeToaster'
import { KEYCLOAK_TOKEN_COOKIE_NAME } from './common'
import { getKeycloakConfigQueryOptions } from './queries'
import { loginFn, logoutFn } from './server-functions'

const isClientSide = typeof window !== 'undefined'

const AuthContext = createContext<{
  login: (redirectUri?: string) => Promise<void>
  logout: () => Promise<void>
  isReady: boolean
}>({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isReady: false,
})

export const useAuth = () => {
  return use(AuthContext)
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const keycloakRef = useRef<Keycloak | undefined>(undefined)
  const [isReady, setIsReady] = useState(false)
  const { data: keycloakConfig } = useQuery(getKeycloakConfigQueryOptions())

  const { mutate: login } = useMutation({
    mutationFn: (token: string | undefined) => loginFn({ data: { token } }),
  })

  const { mutate: logout } = useMutation({
    mutationFn: () => logoutFn(),
  })

  const updateTokenInCookie = useCallback(async () => {
    const tokenInCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(KEYCLOAK_TOKEN_COOKIE_NAME))
      ?.split('=')
      .at(1)
    const currentToken = keycloakRef.current?.token

    // Server and client are in sync, no need to update
    if (tokenInCookie === currentToken) {
      return
    }

    await new Promise((resolve, reject) => {
      login(currentToken, { onError: (error) => reject(error), onSettled: () => resolve(0) })
    })
    await router.invalidate()
  }, [router, login])

  useEffect(() => {
    if (isClientSide && !keycloakRef.current?.didInitialize && keycloakConfig) {
      keycloakRef.current = new Keycloak(keycloakConfig)

      keycloakRef.current.onReady = () => {
        setIsReady(true)
        updateTokenInCookie()
      }

      keycloakRef.current.onAuthSuccess = () => {
        updateTokenInCookie()
      }
      keycloakRef.current.onAuthRefreshSuccess = () => {
        updateTokenInCookie()
      }

      keycloakRef.current.onAuthError = (error) => {
        updateTokenInCookie()
        toastError('Keycloak error: ' + error)
      }
      keycloakRef.current.onAuthLogout = () => {
        localStorage.removeItem('google_drive_access_token')
        updateTokenInCookie()
      }

      keycloakRef.current.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
      })
    }
  }, [updateTokenInCookie, keycloakConfig])

  const contextValue = useMemo(
    () => ({
      login: async (redirectUri?: string): Promise<void> => {
        if (isClientSide) {
          keycloakRef.current?.login({ redirectUri })
        }
      },
      logout: async (): Promise<void> => {
        if (!isClientSide) {
          return
        }

        // updateTokenInCookie()
        logout(undefined, {
          onError: (error) => {
            toastError('Logout failed: ' + error)
          },
          onSuccess: async () => {
            toastSuccess('Logged out successfully')
            await keycloakRef.current?.logout()
            await router.navigate({ to: '/login' })
          },
        })
      },
      isReady,
    }),
    [isReady, logout, router],
  )

  return <AuthContext value={contextValue}>{children}</AuthContext>
}
