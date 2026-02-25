import { logger } from './common'
import { initializeOnce } from './initialize'

export { default as modelProvider } from './model-provider'
export * from './model-provider'

export { default as modelCalls } from './model-calls'
export * from './model-calls'

export { default as providerHealth } from './provider-health'
export * from './provider-health'

export { default as workerRegistry } from './worker-registry'
export * from './worker-registry'

export { default as workspaceConfig } from './workspace-config'
export * from './workspace-config'

export { default as workspaceProcessing } from './workspace-processing'
export * from './workspace-processing'

export { default as workspaceUsage } from './workspace-usage'
export * from './workspace-usage'

initializeOnce().catch((error) => {
  logger.error('Error initializing Event Service Client:', error)
})

export { isInitialized as isEventServiceClientInitialized } from './initialize'
