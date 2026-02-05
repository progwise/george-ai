export const CONFIG_VARS = [
  'DATABASE_URL',
  'LOG_LEVEL',
  'IS_PRODUCTION',
  'TEST_DB_HOST',
  'TEST_DB_PORT',
  'TEST_DB_USER',
  'TEST_DB_PASSWORD',
] as const
export type ConfigVar = (typeof CONFIG_VARS)[number]

export function getConfig(config: 'DATABASE_URL' | 'TEST_DB_HOST' | 'TEST_DB_USER' | 'TEST_DB_PASSWORD'): string
export function getConfig(config: 'TEST_DB_PORT'): number
export function getConfig(config: 'IS_PRODUCTION'): boolean
export function getConfig(config: ConfigVar): string | undefined
export function getConfig(config: ConfigVar): string | undefined | boolean | number {
  switch (config) {
    case 'DATABASE_URL': {
      const value = process.env['DATABASE_URL']
      if (!value) {
        throw new Error(`Missing required config var: ${config}`)
      }
      return value
    }
    case 'TEST_DB_HOST':
      return process.env[config] || 'gai-chatweb-db'
    case 'TEST_DB_USER':
      return process.env[config] || 'chatweb'
    case 'TEST_DB_PASSWORD':
      return process.env[config] || 'password'
    case 'TEST_DB_PORT':
      return process.env[config] ? parseInt(process.env[config]) : 5432
    case 'LOG_LEVEL':
      return process.env[config] || 'INFO'
    case 'IS_PRODUCTION':
      return process.env.NODE_ENV === 'production'
    default:
      throw new Error(`Unknown config var: ${config}`)
  }
}

export default getConfig
