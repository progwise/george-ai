import React, { useContext, useEffect } from 'react'
import { createContext, useState } from 'react'
import Keycloak from 'keycloak-js'
import { getKeycloakConfig, getUserInformation } from './auth.server'
import { User } from './gql/graphql'

function initKeycloak({ keycloakUrl, realm, clientId }) {
  const keycloak = new Keycloak({
    url: keycloakUrl,
    realm: realm,
    clientId: clientId,
  })

  keycloak.init({
    onLoad: 'check-sso',
  })

  return keycloak
}

export interface AuthContext {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  user: User | null
  profileUrl?: string
}

const AuthContext = createContext<AuthContext | null>({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  user: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authContext, setAuthContext] = useState<AuthContext>({
    isAuthenticated: false,
    login: async () => {},
    logout: async () => {},
    user: null,
  })
  useEffect(() => {
    getKeycloakConfig().then((config) => {
      const keycloak = initKeycloak({
        keycloakUrl: config.KEYCLOAK_URL,
        realm: config.KEYCLOAK_REALM,
        clientId: config.KEYCLOAK_CLIENT_ID,
      })
      keycloak.createRegisterUrl().then((url) => {
        setAuthContext((oldContext) => ({
          ...oldContext,
          registerUrl: url,
        }))
      })

      keycloak.onAuthSuccess = async () => {
        if (!keycloak.token) {
          throw new Error('Got no token')
        }

        const { login } = await getUserInformation({ data: keycloak.token })

        setAuthContext({
          isAuthenticated: true,
          login: async () => {
            keycloak.login()
          },
          logout: async () => {
            keycloak.logout()
          },
          user: login || null,
          profileUrl: `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/account?referrer=${config.KEYCLOAK_CLIENT_ID}&referrer_uri=${window.location.href}`,
        })
      }
      setAuthContext((oldContext) => ({
        ...oldContext,
        login: async () => {
          keycloak.login()
        },
        logout: async () => {
          keycloak.logout()
        },
      }))
    })
  }, [])

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
