import { logger } from './common'
import { ensureModelCallsStream } from './model-calls'
import { ensureProviderInstanceBucket } from './provider-instance'
import { ensureWorkerRegistryBucket } from './worker-registry'
import { ensureWorkspaceProcessingStream } from './workspace-processing'
import { ensureWorkspaceConfigBucket } from './workspace-registry'
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
    ensureProviderInstanceBucket().catch((error) => {
      logger.error('Error initializing provider instance bucket:', error)
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
