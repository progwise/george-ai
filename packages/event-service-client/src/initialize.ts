import { ensureActionStream } from './action'
import { logger } from './common'
import { ensureRegistryBucket } from './registry'
import { ensureStateBucket } from './state'
import { ensureWorkerSlotBucket } from './worker-slot'

let initializeOncePromise: Promise<void> | null = null

export const isInitialized = async () => {
  await initializeOnce()
  return true
}

export function initializeOnce(): Promise<void> {
  if (initializeOncePromise) {
    return initializeOncePromise
  }
  initializeOncePromise = initializeEventServiceClient()
  return initializeOncePromise
}

const initializeEventServiceClient = async () => {
  await Promise.all([
    ensureWorkerSlotBucket().catch((error) => {
      logger.error('Error initializing worker slot bucket:', error)
      throw error
    }),
    ensureRegistryBucket().catch((error) => {
      logger.error('Error initializing registry bucket:', error)
      throw error
    }),
    ensureActionStream().catch((error) => {
      logger.error('Error initializing action stream:', error)
      throw error
    }),
    ensureStateBucket().catch((error) => {
      logger.error('Error initializing state bucket', error)
      throw error
    }),
  ])
    .then((result) => {
      logger.info('Event Service Client initialized successfully')
      return result
    })
    .catch((error) => {
      logger.error('Error initializing Event Service Client:', error)
      throw error
    })
}
