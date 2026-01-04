import { eventClient } from '../../shared'
import { ensureWorkspaceStream } from '../workspace-setup'
import { EmbeddingFinishedEventSchema, EmbeddingProgressEventSchema, EmbeddingRequestEventSchema } from './schemas'
import type { EmbeddingFinishedEvent, EmbeddingProgressEvent, EmbeddingRequestEvent } from './schemas'

export const subscribeEmbeddingRequests = async ({
  subscriptionName,
  workspaceId,
  handler,
}: {
  subscriptionName: string
  workspaceId: string
  handler: (event: EmbeddingRequestEvent) => Promise<void>
}) => {
  const streamName = await ensureWorkspaceStream(workspaceId)
  const cleanup = await eventClient.subscribe({
    subscriptionName,
    streamName,
    subjectFilter: `workspace.${workspaceId}.file-embedding-request`,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = EmbeddingRequestEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding request event:', error)
        throw error
      }
    },
  })

  return cleanup
}

export const subscribeEmbeddingProgress = async ({
  subscriptionName,
  workspaceId,
  handler,
}: {
  subscriptionName: string
  workspaceId: string
  handler: (event: EmbeddingProgressEvent) => Promise<void>
}) => {
  const streamName = await ensureWorkspaceStream(workspaceId)
  const cleanup = await eventClient.subscribe({
    subscriptionName,
    streamName,
    subjectFilter: `workspace.${workspaceId}.file-embedding-progress`,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = EmbeddingProgressEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding progress event:', error)
        throw error
      }
    },
  })

  return cleanup
}

export const subscribeEmbeddingFinished = async ({
  subscriptionName,
  workspaceId,
  handler,
}: {
  subscriptionName: string
  workspaceId: string
  handler: (event: EmbeddingFinishedEvent) => Promise<void>
}) => {
  const streamName = await ensureWorkspaceStream(workspaceId)
  const cleanup = await eventClient.subscribe({
    subscriptionName,
    streamName,
    subjectFilter: `workspace.${workspaceId}.file-embedding-finished`,
    handler: async (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const event = EmbeddingFinishedEventSchema.parse(JSON.parse(decoded))
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding finished event:', error)
        throw error
      }
    },
  })

  return cleanup
}
