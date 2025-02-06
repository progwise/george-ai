import Keycloak from 'keycloak-js'
import { ensureBackendUser, getKeycloakConfig } from './auth.server'
import { AuthContext } from './auth-context'

const keycloakConfig = await getKeycloakConfig()

const getKeycloak = () => {
  const keycloak = new Keycloak(keycloakConfig)

  if (typeof window !== 'undefined') {
    keycloak.init({
      onLoad: 'check-sso',
    })
  }
  return keycloak
}

const registerAuthEvents = (
  keycloak: Keycloak,
  router: { invalidate: () => void },
  auth: AuthContext,
) => {
  keycloak.onAuthSuccess = async () => {
    auth.isAuthenticated = true
    if (!keycloak.token) {
      console.error(
        'No token found in keycloak but onAuthSuccess event was triggered',
      )
      return
    }
    const { login } = await ensureBackendUser({ data: keycloak.token })
    auth.user = login || null
    router.invalidate()
  }
}

export { getKeycloak, registerAuthEvents }
