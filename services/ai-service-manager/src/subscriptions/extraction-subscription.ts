import {
  addWorkspaceToWorkerEntry,
  publishWorkspaceEvent,
  removeWorkspaceFromWorkerEntry,
  subscribeWorkspaceEvent,
} from '@george-ai/event-service-client'
import {
  WorkspaceEvent,
  WorkspaceEventType,
  WorkspaceFileEmbeddingRequestEventSchema,
} from '@george-ai/event-service-client/src/workspace-stream/schema'
import { createLogger } from '@george-ai/web-utils'

import { WORKER_ID } from '../constants'
import { embedFile } from '../workers'

const logger = createLogger('Extraction Subscription')

const extractionSubscriptions = new Map<string, () => Promise<void>>()

export const getSubscribedExtractionWorkspaces = () => {
  return Array.from(extractionSubscriptions.keys())
}

export const subscribeExtractionEvents = async (workspaceId: string) => {
  logger.info('Subscribing to workspace extraction events', { workspaceId })
  await addWorkspaceToWorkerEntry(WORKER_ID, workspaceId, 'EXTRACTION')
  // Subscribe to embedding request events
  const cleanup = await subscribeWorkspaceEvent({
    workspaceId,
    eventTypes: [WorkspaceEventType.EmbeddingRequest],
    handler: handleEmbeddingEvent,
  })
  embeddingSubscriptions.set(workspaceId, cleanup)
}

export const unsubscribeEmbeddingEvents = async (workspaceId: string) => {
  logger.info('Unsubscribing from workspace embedding events', { workspaceId })
  const cleanup = embeddingSubscriptions.get(workspaceId)
  if (!cleanup) {
    logger.warn('No embedding event subscription found to unsubscribe', { workspaceId })
    return
  }
  await cleanup()
  embeddingSubscriptions.delete(workspaceId)
  await removeWorkspaceFromWorkerEntry(WORKER_ID, workspaceId, 'EMBEDDING')
}

export const handleEmbeddingEvent = async (event: WorkspaceEvent) => {
  logger.info('Processing workspace embedding event', {
    eventType: event.eventType,
    workspaceId: event.workspaceId,
  })
  const embedFileEvent = WorkspaceFileEmbeddingRequestEventSchema.parse(event)
  try {
    logger.info('Parsed embedding request event', {
      fileId: embedFileEvent.fileId,
      workspaceId: embedFileEvent.workspaceId,
    })
    const result = await embedFile(embedFileEvent)
    await publishWorkspaceEvent({
      version: 1,
      workspaceId: embedFileEvent.workspaceId,
      eventType: WorkspaceEventType.EmbeddingFinished,
      chunkCount: result.chunkCount,
      chunkSize: result.chunkSize,
      processingTimeMs: result.processingTimeMs,
      fileId: embedFileEvent.fileId,
      libraryId: embedFileEvent.libraryId,
      success: result.success,
      message: result.message,
    })
    logger.info('Published EmbeddingFinished event', {
      fileId: embedFileEvent.fileId,
      workspaceId: embedFileEvent.workspaceId,
      success: result.success,
    })
  } catch (error) {
    const message = `Failed to process embedding event for workspace ${event.workspaceId}, file ${embedFileEvent.fileId}: \n${
      error instanceof Error ? error.message : 'Unknown error'
    }`
    logger.error('Failed to process embedding event', {
      workspaceId: event.workspaceId,
      fileId: embedFileEvent.fileId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    await publishWorkspaceEvent({
      version: 1,
      workspaceId: embedFileEvent.workspaceId,
      eventType: WorkspaceEventType.EmbeddingFinished,
      chunkCount: 0,
      chunkSize: 0,
      processingTimeMs: 0,
      fileId: embedFileEvent.fileId,
      libraryId: embedFileEvent.libraryId,
      success: false,
      message,
    })
    throw error
  }
}
