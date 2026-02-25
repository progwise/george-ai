import { logger } from './common'
import { ensureModelCallsStream } from './model-calls'
import { ensureProviderHealthBucket } from './provider-health'
import { ensureWorkerRegistryBucket } from './worker-registry'
import { ensureWorkspaceConfigBucket } from './workspace-config'
import { ensureWorkspaceProcessingStream } from './workspace-processing'
import { ensureWorkspaceUsageStream } from './workspace-usage'

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
    ensureModelCallsStream().catch((error) => {
      logger.error('Error initializing provider calls stream:', error)
      throw error
    }),
    ensureProviderHealthBucket().catch((error) => {
      logger.error('Error initializing provider health bucket:', error)
      throw error
    }),
    ensureWorkerRegistryBucket().catch((error) => {
      logger.error('Error initializing worker registry bucket:', error)
      throw error
    }),
    ensureWorkspaceConfigBucket().catch((error) => {
      logger.error('Error initializing management stream:', error)
      throw error
    }),
    ensureWorkspaceProcessingStream().catch((error) => {
      logger.error('Error initializing workspace processing stream:', error)
      throw error
    }),
    ensureWorkspaceUsageStream().catch((error) => {
      logger.error('Error initializing usage stream:', error)
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
