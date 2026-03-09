import { logger } from './common'
import { initializeOnce } from './initialize'

export * from './action'
export * from './registry'
export * from './worker-slot'
export * from './state'

initializeOnce().catch((error) => {
  logger.error('Error initializing Event Service Client:', error)
})

export { isInitialized as isEventServiceClientInitialized } from './initialize'
