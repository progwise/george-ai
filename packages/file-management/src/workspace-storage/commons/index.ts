import fs from '../../file-system'
import { logger } from './commons'
import { WORKSPACES_FOLDER_NAME } from './constants'

export * from './constants'
export * from './commons'
export * from './uri'

export { fs }

export const workspaceStorageRoot = fs.getFolderPath(fs.getRootPath(), WORKSPACES_FOLDER_NAME)

fs.ensureFolderOnce(workspaceStorageRoot).catch((error) => {
  logger.error('Error ensuring workspace storage root directory exists', {
    path: workspaceStorageRoot,
    error,
    process: process.pid,
  })
  throw error
})
