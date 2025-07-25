import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import Keycloak from 'keycloak-js'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deleteCookie } from 'vinxi/http'
import { z } from 'zod'

import { toastError } from '../components/georgeToaster'
import { getKeycloakConfig } from './auth.server'
import { getUserQueryOptions } from './get-user'

export const KEYCLOAK_TOKEN_COOKIE_NAME = 'keycloak-token'
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

const setKeycloakTokenInCookie = createServerFn({ method: 'POST' })
  .validator((data: { token?: string }) => z.object({ token: z.string().optional() }).parse(data))
  .handler(({ data: { token } }) => {
    if (!token) {
      return deleteCookie(KEYCLOAK_TOKEN_COOKIE_NAME)
    }

    setCookie(KEYCLOAK_TOKEN_COOKIE_NAME, token)
  })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { refetch: refetchUserQuery } = useQuery(getUserQueryOptions())
  const keycloakRef = useRef<Keycloak | undefined>(undefined)
  const [isReady, setIsReady] = useState(false)
  const { data: keycloakConfig } = useQuery({
    queryKey: ['keycloakConfig'],
    queryFn: () => getKeycloakConfig(),
    staleTime: Infinity,
  })

  const updateTokenInCookie = useCallback(async () => {
    const tokenInCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(KEYCLOAK_TOKEN_COOKIE_NAME))
      ?.split('=')
      .at(1)
    const currentToken = keycloakRef.current?.token

    const serverAndClientInSync = tokenInCookie === currentToken

    if (serverAndClientInSync) {
      return
    }

    /**
     * For some reason, the updated cookie is not immediately available when reloading the page (router.invalidate).
     * Because of that, the user is not loaded after successful login.
     * Using a server function to set the cookie and not using document.cookie = ... seams more reliable, same for waiting a bit.
     */
    await setKeycloakTokenInCookie({ data: { token: currentToken } })
    await new Promise((resolve) => setTimeout(resolve, 100))

    await refetchUserQuery()
    await router.invalidate()
  }, [refetchUserQuery, router])

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
      login: async (redirectUri?: string): Promise<void> =>
        isClientSide ? await keycloakRef.current?.login({ redirectUri }) : undefined,
      logout: async (): Promise<void> => {
        if (!isClientSide) {
          return
        }

        await keycloakRef.current?.logout()
        updateTokenInCookie()
      },
      isReady,
    }),
    [updateTokenInCookie, isReady],
  )

  return <AuthContext value={contextValue}>{children}</AuthContext>
}
