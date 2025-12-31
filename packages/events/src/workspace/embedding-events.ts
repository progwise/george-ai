import type { EventClient } from '@george-ai/event-service-client'

import { type EmbeddingRequestEvent, EmbeddingRequestEventSchema } from './event-types'
import { ensureWorkspaceStream } from './workspace-setup'

export const publishEmbeddingRequest = async (client: EventClient, request: EmbeddingRequestEvent) => {
  await ensureWorkspaceStream(client, request.workspaceId)
  const subject = `workspace.${request.workspaceId}.file-embedding-request`
  const payload = new TextEncoder().encode(JSON.stringify(request))
  await client.publish({
    subject,
    payload,
    timeoutMs: request.timeoutMs,
  })
}

export const subscribeEmbeddingRequests = async (
  client: EventClient,
  {
    subscriptionName,
    workspaceId,
    handler,
  }: {
    subscriptionName: string
    workspaceId: string
    handler: (event: EmbeddingRequestEvent) => Promise<void>
  },
) => {
  const streamName = await ensureWorkspaceStream(client, workspaceId)
  const cleanup = await client.subscribe({
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
