import { lstat, rm } from 'node:fs/promises'

import { isNodeError, logger } from './commons'

export async function deleteFolderOrThrow(path: string): Promise<void> {
  try {
    const stat = await lstat(path)
    if (!stat.isDirectory()) {
      logger.error(`Path is not a directory: ${path}`)
      throw new Error(`Path is not a directory: ${path}`)
    }
    // If access doesn't throw, the directory exists, so we can delete it
    await rm(path, { recursive: true, force: true })
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      // Directory does not exist, we can ignore this error
      logger.error('Folder does not exist', { path })
      throw error
    }
    // For any other errors, rethrow them
    logger.error('Error deleting folder', { path, error })
    throw error
  }
}

export async function deleteFolder(path: string): Promise<void> {
  try {
    const stat = await lstat(path)
    if (!stat.isDirectory()) {
      logger.error(`Path is not a directory: ${path}`)
      throw new Error(`Path is not a directory: ${path}`)
    }
    // If access doesn't throw, the directory exists, so we can delete it
    await rm(path, { recursive: true, force: true })
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      // Directory does not exist, we can ignore this error
      return
    }
    // For any other errors, rethrow them
    logger.error('Error deleting folder', { path, error })
    throw error
  }
}
