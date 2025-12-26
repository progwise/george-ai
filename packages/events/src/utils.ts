/**
 * Utility functions for event handling
 */
import type { FileEmbeddedEvent, FileEmbeddingFailedEvent, FileExtractedEvent } from './types'

/**
 * Create a FileExtractedEvent
 */
export const createFileExtractedEvent = (
  params: Omit<FileExtractedEvent, 'type' | 'timestamp'>,
): FileExtractedEvent => {
  return {
    type: 'FileExtracted',
    timestamp: new Date().toISOString(),
    ...params,
  }
}

/**
 * Create a FileEmbeddedEvent
 */
export const createFileEmbeddedEvent = (params: Omit<FileEmbeddedEvent, 'type' | 'timestamp'>): FileEmbeddedEvent => {
  return {
    type: 'FileEmbedded',
    timestamp: new Date().toISOString(),
    ...params,
  }
}

/**
 * Create a FileEmbeddingFailedEvent
 */
export const createFileEmbeddingFailedEvent = (
  params: Omit<FileEmbeddingFailedEvent, 'type' | 'timestamp'>,
): FileEmbeddingFailedEvent => {
  return {
    type: 'FileEmbeddingFailed',
    timestamp: new Date().toISOString(),
    ...params,
  }
}

/**
 * Get NATS server URL from environment
 */
export const getNatsServerUrl = (): string => {
  return process.env.NATS_URL || 'nats://gai-nats:4222'
}

/**
 * Get NATS credentials from environment
 */
export const getNatsCredentials = (): { user?: string; pass?: string; token?: string } => {
  return {
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASSWORD,
    token: process.env.NATS_TOKEN,
  }
}
