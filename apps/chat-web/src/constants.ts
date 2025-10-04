/**
 * Server-side constants read from environment variables at runtime.
 * These are only available in server-side code (server functions, API routes, etc.)
 *
 * For client-side code, use getRuntimeConfig() from runtime-config.server.ts
 * which fetches configuration from the server at runtime.
 *
 * This allows deploying one Docker image to multiple environments with
 * different configuration via environment variables.
 */
// Import dotenv to load .env file in development
// This is needed because Vite's envPrefix only exposes vars to import.meta.env (client-side),
// but we need process.env (server-side) for runtime configuration support.
// In production (Docker), environment variables are provided by the container runtime.
import 'dotenv/config'

export const BACKEND_URL = process.env.BACKEND_URL || ''
export const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL || ''
export const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || ''
export const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || ''
export const KEYCLOAK_URL = process.env.KEYCLOAK_URL || ''
export const GRAPHQL_API_KEY = process.env.GRAPHQL_API_KEY || ''
export const GIT_COMMIT_SHA = process.env.GIT_COMMIT_SHA || 'local-dev-web'
export const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || ''
export const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || ''
