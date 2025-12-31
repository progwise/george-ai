// Namespace exports for clean API
export * as workspace from './workspace'
export * as admin from './admin'

// Re-export event types for convenience
export type { EmbeddingRequestEvent, WorkspaceProviderConfigEvent } from './workspace'
export type { WorkspaceCreatedEvent, WorkspaceDeletedEvent } from './admin/event-types'
