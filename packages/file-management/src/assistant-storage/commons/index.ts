import { ensureFolderOnce, getFolderPath } from '../../file-system'
import { ASSISTANT_STORAGE_BASE_PATH } from './constants'
import { logger } from './logger'

export * from './constants'
export * from './logger'

export const assistantStorageRoot = getFolderPath(ASSISTANT_STORAGE_BASE_PATH)

ensureFolderOnce(assistantStorageRoot).catch((error) => {
  logger.error('Error ensuring assistant storage root directory exists', {
    path: assistantStorageRoot,
    error,
    process: process.pid,
  })
  throw error
})
