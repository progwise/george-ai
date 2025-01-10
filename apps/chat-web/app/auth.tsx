import React, { useContext, useEffect } from 'react'
import { createContext, useState } from 'react'
import Keycloak from 'keycloak-js'
import { getKeycloakConfig } from './auth.server'

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
  user: string | null
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
      keycloak.onAuthSuccess = () => {
        setAuthContext({
          isAuthenticated: true,
          login: async () => {
            keycloak.login()
          },
          logout: async () => {
            keycloak.logout()
          },
          user: keycloak.tokenParsed?.preferred_username,
          profileUrl: `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/account?referrer=${config.KEYCLOAK_CLIENT_ID}&referrer_uri=${window.location.href}`,
        })
      }
      console.log('keycloak', keycloak)
      setAuthContext((oldContext) => ({
        ...oldContext,
        login: keycloak.login,
        logout: keycloak.logout,
        isAuthenticated: keycloak.authenticated || false,
        user: keycloak.tokenParsed?.preferred_username,
      }))
    })
  }, [])

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  //   if (!context) {
  //     throw new Error('useAuth must be used within an AuthProvider')
  //   }
  return context
}
