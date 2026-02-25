import { logger } from './common'

let initializeOncePromise: Promise<void> | null = null

export async function initializeOnce(): Promise<void> {
  if (initializeOncePromise) {
    return initializeOncePromise
  }
  initializeOncePromise = (async () => {
    // Initialization logic here
    logger.info('Initializing app-database package.')
  })()
  return initializeOncePromise
}
