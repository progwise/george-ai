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
 * Get required env var - throws if missing (fail-fast at startup)
 */
const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value
}

/**
 * Get optional env var
 */
const optionalEnv = (name: string): string | undefined => {
  return process.env[name]
}

/**
 * Get optional env var with default
 */
const optionalEnvWithDefault = (name: string, defaultValue: string): string => {
  return process.env[name] ?? defaultValue
}

// =============================================================================
// DATABASE (REQUIRED - fail fast at startup)
// =============================================================================

/** PostgreSQL connection string - REQUIRED at startup */
export const DATABASE_URL = requireEnv('DATABASE_URL')

// =============================================================================
// FILE STORAGE (Feature-required)
// =============================================================================

/** Path for file uploads (user avatars, library files, etc.) */
export const UPLOADS_PATH = optionalEnv('UPLOADS_PATH')

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

// =============================================================================
// APPLICATION URLS (Feature-required)
// =============================================================================

/** Backend public URL (for file download links) */
export const BACKEND_PUBLIC_URL = optionalEnv('BACKEND_PUBLIC_URL')

/** Public app URL (for conversation invitation links) */
export const PUBLIC_APP_URL = optionalEnv('PUBLIC_APP_URL')

// =============================================================================
// VERSION / BUILD INFO (Optional)
// =============================================================================

/** Git commit SHA (set at build time) */
export const GIT_COMMIT_SHA = optionalEnv('GIT_COMMIT_SHA')

/** Current environment (development, production, test) */
export const NODE_ENV = optionalEnvWithDefault('NODE_ENV', 'development')

/** Whether running in production mode */
export const IS_PRODUCTION = NODE_ENV === 'production'

/** Log level for structured logging (ERROR, WARN, INFO, DEBUG) */
export const LOG_LEVEL = optionalEnvWithDefault('LOG_LEVEL', 'INFO') as 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

// =============================================================================
// AI PROVIDERS (Optional)
// =============================================================================

/** OpenAI API key (optional - enables OpenAI provider) */
export const OPENAI_API_KEY = optionalEnv('OPENAI_API_KEY')

/** OpenAI base URL (optional - custom endpoint) */
export const OPENAI_BASE_URL = optionalEnv('OPENAI_BASE_URL')

/** SMB Crawler service URL (optional - enables SMB crawling) */
export const SMB_CRAWLER_URL = optionalEnv('SMB_CRAWLER_URL')

// =============================================================================
// OLLAMA INSTANCES (Optional)
// =============================================================================

/**
 * Ollama instance configuration type
 */
export interface OllamaInstance {
  /** Base URL for the Ollama API */
  baseUrl: string
  /** Optional API key for authentication */
  apiKey?: string
  /** VRAM available in GB (default: 16) */
  vramGb: number
  /** Instance name for display purposes */
  name: string
}

/**
 * All configured Ollama instances
 *
 * Built at startup from environment variables:
 * - OLLAMA_BASE_URL (primary instance)
 * - OLLAMA_BASE_URL_1 through OLLAMA_BASE_URL_9 (additional instances)
 *
 * Each instance can optionally have:
 * - OLLAMA_API_KEY[_N]: API key for authentication
 * - OLLAMA_VRAM_GB[_N]: VRAM in GB (default: 16)
 */
export const OLLAMA_INSTANCES: OllamaInstance[] = (() => {
  const instances: OllamaInstance[] = []

  // Primary instance (OLLAMA_BASE_URL)
  const primaryBaseUrl = process.env.OLLAMA_BASE_URL
  if (primaryBaseUrl) {
    instances.push({
      baseUrl: primaryBaseUrl,
      apiKey: process.env.OLLAMA_API_KEY,
      vramGb: parseInt(process.env.OLLAMA_VRAM_GB ?? '16', 10),
      name: 'Primary Ollama',
    })
  }

  // Additional instances (OLLAMA_BASE_URL_1 through OLLAMA_BASE_URL_9)
  for (let i = 1; i <= 9; i++) {
    const baseUrl = process.env[`OLLAMA_BASE_URL_${i}`]
    if (baseUrl) {
      instances.push({
        baseUrl,
        apiKey: process.env[`OLLAMA_API_KEY_${i}`],
        vramGb: parseInt(process.env[`OLLAMA_VRAM_GB_${i}`] ?? '16', 10),
        name: `Ollama Instance ${i + 1}`,
      })
    }
  }

  return instances
})()

// =============================================================================
// TESTING (only used in test environment)
// =============================================================================

/** Test database URL (used during testing to swap with DATABASE_URL) */
export const DATABASE_URL_TEST = optionalEnv('DATABASE_URL_TEST')
