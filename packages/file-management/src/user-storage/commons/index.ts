import { getConfigValue } from '@george-ai/app-commons'

import { ensureFolderOnce } from '../../file-system'
import { logger } from './logger'

export * from './constants'
export * from './logger'

export const userStorageRoot = getConfigValue('STORAGE_PATH_USERS')

ensureFolderOnce(userStorageRoot).catch((error) => {
  logger.error('Error ensuring user storage root directory exists', {
    path: userStorageRoot,
    error,
    process: process.pid,
  })
  throw error
})
