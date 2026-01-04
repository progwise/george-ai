// Export all workspace event modules
export * as embedding from './embedding'
export * as management from './management'
export * as contentExtraction from './content-extraction'
export * as usageTracking from './usage-tracking'

// Re-export workspace setup utilities
export * from './workspace-setup'

// Convenience re-exports for commonly used types
export type { EmbeddingRequestEvent, EmbeddingProgressEvent, EmbeddingFinishedEvent } from './embedding'
export type { WorkspaceManagementEvent } from './management'
export type { ContentExtractionRequestEvent, ContentExtractionFinishedEvent } from './content-extraction'
export type { AiUsageTrackingEvent } from './usage-tracking'

// Convenience re-exports for commonly used functions
export { publishEmbeddingRequest, publishEmbeddingProgress, publishEmbeddingFinished } from './embedding'
export { subscribeEmbeddingRequests, subscribeEmbeddingProgress, subscribeEmbeddingFinished } from './embedding'
export { publishManagementEvent } from './management'
export { subscribeManagementEvents } from './management'
