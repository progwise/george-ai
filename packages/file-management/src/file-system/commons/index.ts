import { ensureFolderOnce } from '../ensure-folder-once'
import { ROOT_DIR } from './constants'
import { logger } from './logger'

export * from './logger'
export * from './constants'
export * from './is-node-error'

ensureFolderOnce(ROOT_DIR).catch((error) => {
  logger.error('Error ensuring root directory exists', { path: ROOT_DIR, error, process: process.pid })
  throw error
})
