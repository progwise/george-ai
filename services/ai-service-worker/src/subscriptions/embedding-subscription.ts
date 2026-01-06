import { publishWorkspaceEvent, subscribeWorkspaceEvent } from '@george-ai/event-service-client'
import {
  WorkspaceEvent,
  WorkspaceEventType,
  WorkspaceFileEmbeddingRequestEventSchema,
} from '@george-ai/event-service-client/src/workspace-stream/schema'

import { embedFile } from '../workers'

const embeddingSubscriptions = new Map<string, () => Promise<void>>()

export const getSubscribedEmbeddingWorkspaces = () => {
  return Array.from(embeddingSubscriptions.keys())
}

export const subscribeEmbeddingEvents = async (workspaceId: string) => {
  console.log(`Subscribing to workspace embedding events for workspace ${workspaceId}...`)
  // Subscribe to embedding request events
  const cleanup = await subscribeWorkspaceEvent({
    workspaceId,
    eventTypes: [WorkspaceEventType.EmbeddingRequest],
    handler: handleEmbeddingEvent,
  })
  embeddingSubscriptions.set(workspaceId, cleanup)
}

export const unsubscribeEmbeddingEvents = async (workspaceId: string) => {
  console.log(`Unsubscribing from workspace embedding events for workspace ${workspaceId}...`)
  const cleanup = embeddingSubscriptions.get(workspaceId)
  if (!cleanup) {
    console.warn(`No embedding event subscription found for workspace ${workspaceId} to unsubscribe.`)
    return
  }
  await cleanup()
  embeddingSubscriptions.delete(workspaceId)
}

export const handleEmbeddingEvent = async (event: WorkspaceEvent) => {
  console.log(`Processing workspace embedding event ${event.eventType} for workspace ${event.workspaceId}...`)
  const embedFileEvent = WorkspaceFileEmbeddingRequestEventSchema.parse(event)
  try {
    console.log(
      `Parsed embedding request event for file ${embedFileEvent.fileId} in workspace ${embedFileEvent.workspaceId}`,
    )
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
    console.log(
      `Published EmbeddingCompleted event for file ${embedFileEvent.fileId} in workspace ${embedFileEvent.workspaceId}`,
    )
  } catch (error) {
    console.error(`Error handling embedding event for workspace ${event.workspaceId}:`, error)
  }
}
