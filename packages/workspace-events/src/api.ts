import { NatsClient } from './nats-client'
import { type EmbeddingRequestEvent, EmbeddingRequestEventSchema } from './types'

let natsClient: NatsClient | null = null

/**
 * Get or create the singleton NATS client
 */
async function getNatsClient(): Promise<NatsClient> {
  if (natsClient && natsClient.isConnected()) {
    return natsClient
  }

  // Create new client
  natsClient = new NatsClient()

  // Get config from environment
  const servers = process.env.NATS_URL || 'nats://gai-nats:4222'
  const user = process.env.NATS_USER
  const pass = process.env.NATS_PASSWORD
  const token = process.env.NATS_TOKEN

  await natsClient.connect({
    servers,
    user,
    pass,
    token,
  })

  return natsClient
}

export const publishEmbeddingRequest = async (request: EmbeddingRequestEvent) => {
  const client = await getNatsClient()
  const subject = `workspace.${request.workspaceId}.events.${request.eventName}`
  await client.publish({
    subject,
    payload: JSON.stringify(request),
    timeout: request.timeoutMs,
  })
}

export const subscribeEmbeddingRequests = async ({
  consumerName,
  workspaceId,
  handler,
}: {
  consumerName: string
  workspaceId: string
  handler: (event: EmbeddingRequestEvent) => Promise<void>
}) => {
  const client = await getNatsClient()

  const cleanup = await client.subscribe({
    workspaceId,
    consumerName,
    eventType: 'file-embedding-request',
    handler: async (data: Uint8Array<ArrayBufferLike>) => {
      // Decode event
      const eventData = new TextDecoder().decode(data)

      try {
        const event = EmbeddingRequestEventSchema.parse(JSON.parse(eventData))
        await handler(event)
      } catch (error) {
        console.error('Error handling embedding request event:', error)
      }
    },
  })

  return cleanup
}
/**
 * Disconnect from NATS (useful for graceful shutdown)
 */
export async function disconnect(): Promise<void> {
  if (natsClient) {
    await natsClient.disconnect()
    natsClient = null
  }
}
