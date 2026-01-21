import { createLogger } from '@george-ai/web-utils'

import { initializeProviderCallsStream } from './provider-calls'
import { initializeProviderHealthBucket } from './provider-health'
import { initializeWorkerRegistryBucket } from './worker-registry'
import { initializeWorkspaceConfigBucket } from './workspace-config'
import { initializeWorkspaceProcessingStream } from './workspace-processing'
import { initializeWorkspaceUsageStream } from './workspace-usage'

const logger = createLogger('event-service-client:index')

export const initializeEventServiceClient = async () =>
  Promise.all([
    initializeProviderCallsStream().catch((error) => {
      logger.error('Error initializing provider calls stream:', error)
      throw error
    }),
    initializeProviderHealthBucket().catch((error) => {
      logger.error('Error initializing provider health bucket:', error)
      throw error
    }),
    initializeWorkerRegistryBucket().catch((error) => {
      logger.error('Error initializing worker registry bucket:', error)
      throw error
    }),
    initializeWorkspaceConfigBucket().catch((error) => {
      logger.error('Error initializing management stream:', error)
      throw error
    }),
    initializeWorkspaceProcessingStream().catch((error) => {
      logger.error('Error initializing workspace processing stream:', error)
      throw error
    }),
    initializeWorkspaceUsageStream().catch((error) => {
      logger.error('Error initializing usage stream:', error)
      throw error
    }),
  ])

await initializeEventServiceClient()

export { default as providerCalls } from './provider-calls'
export type {
  AiCall,
  AiResponse,
  AiServiceCall,
  EmbedFileCall,
  EmbedTextChunkCall,
  EmbedFileResponse,
  EmbedTextChunkResponse,
  ChatCompletionCall,
  ChatCompletionResponse,
} from './provider-calls'

export { default as providerHealth } from './provider-health'
export type * from './provider-health'

export { default as workerRegistry } from './worker-registry'
export type * from './worker-registry'

export { default as workspaceConfig } from './workspace-config'
export type * from './workspace-config'

export { default as workspaceProcessing } from './workspace-processing'
export type * from './workspace-processing'

export { default as workspaceUsage } from './workspace-usage'
export type * from './workspace-usage'
