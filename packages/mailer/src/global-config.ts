/**
 * Centralized environment variable configuration
 *
 * This file collects all process.env access points for the pothos-graphql package.
 *
 * Variables are categorized as:
 * - REQUIRED: Fail-fast at startup (e.g., DATABASE_URL)
 * - FEATURE-REQUIRED: Optional here, but consuming modules should validate
 * - OPTIONAL: May or may not be set (e.g., AI providers)
 *
 * All configuration is evaluated at module load time.
 */

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get optional env var
 */
const optionalEnv = (name: string): string | undefined => {
  return process.env[name]
}

// =============================================================================
// SMTP / EMAIL (Feature-required)
// =============================================================================

/** SMTP server hostname for sending emails */
export const SMTP_HOSTNAME = optionalEnv('SMTP_HOSTNAME')

/** SMTP server port (default: 587) */
export const SMTP_PORT = parseInt(optionalEnv('SMTP_PORT') ?? '587')

/** SMTP authentication username */
export const SMTP_USER = optionalEnv('SMTP_USER')

/** SMTP authentication password */
export const SMTP_PASSWORD = optionalEnv('SMTP_PASSWORD')

/** Email address to use as sender (From field) */
export const SMTP_FROM = optionalEnv('SMTP_FROM') ?? 'noreply@george-ai.net'

/** Test recipient email for integration tests (optional) */
export const SMTP_TEST_RECIPIENT = optionalEnv('SMTP_TEST_RECIPIENT')
