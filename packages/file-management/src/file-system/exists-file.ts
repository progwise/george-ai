import { lstat } from 'node:fs/promises'

import { isNodeError, logger } from './commons'

// Can be a file or directory
export const existsFile = async (path: string): Promise<boolean> => {
  try {
    // F_OK checks for the existence of the file/folder
    const stat = await lstat(path)
    if (!stat.isFile()) {
      throw new Error(`Path exists but is not a file: ${path}`)
    }
    return true
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return false
    } else if (isNodeError(error)) {
      logger.error('Error accessing file node error', { path, error })
    } else if (error instanceof Error) {
      logger.error('Error accessing directory instance error', { path, error })
    } else {
      logger.error('Error accessing directory', { path, error })
    }
    throw error
  }
}
