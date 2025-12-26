/**
 * Event type definitions for George AI event-driven architecture
 */

/**
 * Base event interface with common properties
 */
export interface BaseEvent {
  type: string
  workspaceId: string
  timestamp: string
}

/**
 * Published when a file has been successfully extracted to Markdown
 * Triggers the embedding worker to generate embeddings
 */
export interface FileExtractedEvent extends BaseEvent {
  type: 'FileExtracted'
  libraryId: string
  fileId: string
  fileName: string
  markdownPath: string // Relative path: 'fileId/markdown.md'

  // Embedding configuration (from backend database query)
  embeddingModelId: string
  embeddingModelName: string
  embeddingModelProvider: string
  embeddingDimensions: number

  part?: number // For multi-part files
}

/**
 * Published when a file has been successfully embedded in Qdrant
 * Triggers backend to update task status
 */
export interface FileEmbeddedEvent extends BaseEvent {
  type: 'FileEmbedded'
  fileId: string
  processingTaskId: string // The embedding task ID

  qdrantCollection: string // workspace_{workspaceId}
  qdrantNamedVector: string // model_{embeddingModelId}
  chunksCount: number
  chunksSize: number

  part?: number // For multi-part files
}

/**
 * Published when embedding fails
 * Triggers backend to update task status and AI Service Manager to release semaphore
 */
export interface FileEmbeddingFailedEvent extends BaseEvent {
  type: 'FileEmbeddingFailed'
  fileId: string
  processingTaskId: string
  errorMessage: string
}

/**
 * Union type of all event types
 */
export type GeorgeAIEvent = FileExtractedEvent | FileEmbeddedEvent | FileEmbeddingFailedEvent

/**
 * Type guard to check if an event is a FileExtractedEvent
 */
export const isFileExtractedEvent = (event: GeorgeAIEvent): event is FileExtractedEvent => {
  return event.type === 'FileExtracted'
}

/**
 * Type guard to check if an event is a FileEmbeddedEvent
 */
export const isFileEmbeddedEvent = (event: GeorgeAIEvent): event is FileEmbeddedEvent => {
  return event.type === 'FileEmbedded'
}

/**
 * Type guard to check if an event is a FileEmbeddingFailedEvent
 */
export const isFileEmbeddingFailedEvent = (event: GeorgeAIEvent): event is FileEmbeddingFailedEvent => {
  return event.type === 'FileEmbeddingFailed'
}
