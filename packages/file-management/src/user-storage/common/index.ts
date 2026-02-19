import { ensureFolderOnce, getFolderPath } from '../../file-system'
import { USER_STORAGE_BASE_PATH } from './constants'
import { logger } from './logger'

export * from './constants'
export * from './logger'

export const userStorageRoot = getFolderPath(USER_STORAGE_BASE_PATH)

ensureFolderOnce(userStorageRoot).catch((error) => {
  logger.error('Error ensuring user storage root directory exists', {
    path: userStorageRoot,
    error,
    process: process.pid,
  })
  throw error
})
