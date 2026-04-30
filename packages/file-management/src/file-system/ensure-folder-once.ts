import { logger } from './commons'

import { mkdir } from 'fs/promises'

const ensureFolderPromises: Map<string, Promise<void>> = new Map()

export function ensureFolderOnce(path: string): Promise<void> {
  if (ensureFolderPromises.has(path)) {
    return ensureFolderPromises.get(path)!
  }
  const promise = mkdir(path, { recursive: true })
    .then(() => {
      logger.debug('Directory ensured to exist', { path, process: process.pid })
    })
    .catch((error) => {
      logger.error('Error ensuring directory exists', { path, error, process: process.pid })
      throw error
    })
  ensureFolderPromises.set(path, promise)
  return promise
}
