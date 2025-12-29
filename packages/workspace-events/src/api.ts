import type { EventClient } from '@george-ai/event-service-client'

import { type EmbeddingRequestEvent, EmbeddingRequestEventSchema } from './event-types'

export const publishEmbeddingRequest = async (client: EventClient, request: EmbeddingRequestEvent) => {
  await client.publishEvent({
    workspaceId: request.workspaceId,
    eventType: request.eventName,
    payload: request as unknown as Record<string, unknown>,
    timeoutMs: request.timeoutMs,
  })
}

export const subscribeEmbeddingRequests = async (
  client: EventClient,
  {
    consumerName,
    workspaceId,
    handler,
  }: {
    consumerName: string
    workspaceId: string
    handler: (event: EmbeddingRequestEvent) => Promise<void>
  },
) => {
  const cleanup = await client.subscribe({
    workspaceId,
    consumerName,
    eventType: 'file-embedding-request',
    handler: async (payload: Record<string, unknown>) => {
      try {
        const event = EmbeddingRequestEventSchema.parse(payload)
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding request event:', error)
        throw error
      }
    },
  })

  return cleanup
}
