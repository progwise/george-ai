import { logger } from './file-system/commons'

export const CONFIG_VALUES = ['UPLOADS_PATH', 'USER_STORAGE_BASE_PATH', 'ASSISTANT_STORAGE_BASE_PATH'] as const
export type ConfigKey = (typeof CONFIG_VALUES)[number]

export function conf(key: 'ASSISTANT_STORAGE_BASE_PATH'): string
export function conf(key: 'USER_STORAGE_BASE_PATH'): string
export function conf(key: 'UPLOADS_PATH'): string
export function conf(key: ConfigKey): string | undefined {
  const value = process.env[key]
  switch (key) {
    case 'ASSISTANT_STORAGE_BASE_PATH':
      return value || `${conf('UPLOADS_PATH')}/assistant-storage`
    case 'USER_STORAGE_BASE_PATH':
      return value || `${conf('UPLOADS_PATH')}/user-storage`
    case 'UPLOADS_PATH':
      if (!value) {
        logger.error('UPLOADS_PATH environment variable is not set')
        throw new Error('UPLOADS_PATH environment variable is not set')
      }
      return value
    default:
      throw new Error(`Unknown config key: ${key}`)
  }
}
