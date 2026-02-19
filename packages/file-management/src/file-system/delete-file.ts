import { lstat, rm } from 'node:fs/promises'

import { isNodeError, logger } from './commons'

export async function deleteFileOrThrow(path: string): Promise<void> {
  try {
    const stat = await lstat(path)
    if (!stat.isFile()) {
      logger.error(`Path is not a file: ${path}`)
      throw new Error(`Path is not a file: ${path}`)
    }
    // If access doesn't throw, the directory exists, so we can delete it
    await rm(path, { recursive: true, force: true })
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      // Directory does not exist, we can ignore this error
      logger.warn('File does not exist, skipping deletion', { path })
      throw error
    }
    // For any other errors, rethrow them
    logger.error('Error deleting file', { path, error })
    throw error
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const stat = await lstat(path)
    if (!stat.isFile()) {
      logger.error(`Path is not a file: ${path}`)
      throw new Error(`Path is not a file: ${path}`)
    }
    // If access doesn't throw, the directory exists, so we can delete it
    await rm(path, { recursive: true, force: true })
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      // File does not exist, we can ignore this error
      return
    }
    // For any other errors, rethrow them
    logger.error('Error deleting file', { path, error })
    throw error
  }
}
