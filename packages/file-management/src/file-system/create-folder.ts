import { constants } from 'node:fs'
import { access, mkdir } from 'node:fs/promises'

import { isNodeError, logger } from './commons'

export async function createFolder(path: string): Promise<string> {
  try {
    await access(path, constants.F_OK)
    // If access doesn't throw, the directory exists
    throw new Error(`Directory already exists: ${path}`)
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      // Directory does not exist, which is expected
    } else if (isNodeError(err)) {
      logger.error(`Error checking existence of directory ${path}: ${err.message}`)
      throw err
    } else if (err instanceof Error) {
      logger.error(`Error checking existence of directory ${path}: ${err.message}`)
      throw err
    } else {
      logger.error(`Unknown error checking of workspace directory ${path}`)
      throw err
    }
  }
  await mkdir(path, { recursive: true })
  logger.debug('Created directory', { path })
  return path
}
