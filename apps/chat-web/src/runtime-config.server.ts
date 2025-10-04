import { createServerFn } from '@tanstack/react-start'

export interface RuntimeConfig {
  backendUrl: string
  backendPublicUrl: string
  keycloakRealm: string
  keycloakUrl: string
  keycloakClientId: string
  keycloakRedirectUrl: string
  publicAppUrl: string
  gitCommitSha: string
}

/**
 * Server function that provides runtime configuration.
 * This allows deploying the same Docker image to multiple environments
 * with different configuration values set via environment variables.
 *
 * Previously used import.meta.env.GAI_* which baked values into the build,
 * making it impossible to deploy one image to multiple customers.
 */
export const getRuntimeConfig = createServerFn({ method: 'GET' }).handler(async (): Promise<RuntimeConfig> => {
  return {
    backendUrl: process.env.BACKEND_URL || '',
    backendPublicUrl: process.env.BACKEND_PUBLIC_URL || '',
    keycloakRealm: process.env.KEYCLOAK_REALM || '',
    keycloakUrl: process.env.KEYCLOAK_URL || '',
    keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || '',
    keycloakRedirectUrl: process.env.KEYCLOAK_REDIRECT_URL || '',
    publicAppUrl: process.env.PUBLIC_APP_URL || '',
    gitCommitSha: process.env.GIT_COMMIT_SHA || 'unknown',
  }
})
