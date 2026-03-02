import { ConfigKey } from './common'

export function getConfigValue(key: 'IS_PRODUCTION'): boolean
export function getConfigValue(key: 'TEST_DB_PORT'): number
export function getConfigValue(key: 'OPENAI_API_KEY' | 'OPENAI_BASE_URL'): string | undefined
export function getConfigValue(key: 'OLLAMA_INSTANCES'): Array<{
  baseUrl: string
  apiKey?: string
  vramGb: number
  name: string
}>
export function getConfigValue(
  key:
    | 'BACKEND_PUBLIC_URL'
    | 'DATABASE_URL'
    | 'ENCRYPTION_KEY'
    | 'GIT_COMMIT_SHA'
    | 'GITHUB_TOKEN'
    | 'LOG_LEVEL'
    | 'PUBLIC_APP_URL'
    | 'SMB_CRAWLER_URL'
    | 'STORAGE_PATH_ASSISTANTS'
    | 'STORAGE_PATH_CREDENTIALS'
    | 'STORAGE_PATH_USERS'
    | 'STORAGE_PATH_WORKSPACES'
    | 'STORAGE_PATH_WORKSPACES_BACKUP'
    | 'STORAGE_PATH_LEGACY_LIBRARIES'
    | 'TEST_DB_HOST'
    | 'TEST_DB_PORT'
    | 'TEST_DB_USER'
    | 'TEST_DB_PASSWORD',
): string

export function getConfigValue(key: ConfigKey):
  | undefined
  | string
  | number
  | boolean
  | Array<{
      baseUrl: string
      apiKey?: string
      vramGb: number
      name: string
    }>

export function getConfigValue(key: ConfigKey):
  | undefined
  | string
  | number
  | boolean
  | Array<{
      baseUrl: string
      apiKey?: string
      vramGb: number
      name: string
    }> {
  switch (key) {
    case 'IS_PRODUCTION':
      return process.env.NODE_ENV === 'production'
    case 'LOG_LEVEL':
      return process.env[key] ?? 'INFO'
    case 'BACKEND_PUBLIC_URL':
    case 'DATABASE_URL':
    case 'ENCRYPTION_KEY':
    case 'GIT_COMMIT_SHA':
    case 'GITHUB_TOKEN':
    case 'PUBLIC_APP_URL':
    case 'SMB_CRAWLER_URL':
    case 'STORAGE_PATH_ASSISTANTS':
    case 'STORAGE_PATH_CREDENTIALS':
    case 'STORAGE_PATH_USERS':
    case 'STORAGE_PATH_WORKSPACES':
    case 'STORAGE_PATH_WORKSPACES_BACKUP':
    case 'STORAGE_PATH_LEGACY_LIBRARIES':
      if (!process.env[key]) {
        throw new Error(`Missing required config variable: ${key}`)
      }
      return process.env[key]
    case 'TEST_DB_HOST':
      return process.env[key] || 'gai-chatweb-db'
    case 'TEST_DB_USER':
      return process.env[key] || 'chatweb'
    case 'TEST_DB_PASSWORD':
      return process.env[key] || 'password'
    case 'TEST_DB_PORT':
      return process.env[key] ? parseInt(process.env[key]) : 5432
    case 'OPENAI_API_KEY':
    case 'OPENAI_BASE_URL':
      return process.env[key] || undefined
    case 'OLLAMA_INSTANCES':
      return getConfiguredOllamaInstances()
    default:
      throw new Error(`Unknown config variable: ${key}`)
  }
}

const getConfiguredOllamaInstances = () => {
  const instances = []

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
}
