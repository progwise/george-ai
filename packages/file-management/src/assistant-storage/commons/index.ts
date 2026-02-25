import { getConfigValue } from '@george-ai/app-commons'

import { ensureFolderOnce } from '../../file-system'
import { logger } from './logger'

export * from './constants'
export * from './logger'

export const assistantStorageRoot = getConfigValue('STORAGE_PATH_ASSISTANTS')

ensureFolderOnce(assistantStorageRoot).catch((error) => {
  logger.error('Error ensuring assistant storage root directory exists', {
    path: assistantStorageRoot,
    error,
    process: process.pid,
  })
  throw error
})
