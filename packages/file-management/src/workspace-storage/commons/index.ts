import { getConfigValue } from '@george-ai/app-commons'

import fs from '../../file-system'
import { logger } from './commons'

export * from './constants'
export * from './commons'
export * from './uri'

export { fs }

const workspaceStorageRoot = getConfigValue('STORAGE_PATH_WORKSPACES')

fs.ensureFolderOnce(workspaceStorageRoot).catch((error) => {
  logger.error('Error ensuring workspace storage root directory exists', {
    path: workspaceStorageRoot,
    error,
    process: process.pid,
  })
  throw error
})
