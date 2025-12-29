/**
 * NATS implementation of EventClient interface
 * This file is internal - consumers should never import from here directly
 */
import type { EventClient, EventClientAdmin } from './event-client'
import { NatsClient } from './nats-client'

/**
 * NATS-based implementation of EventClient
 * @internal
 */
export class NatsEventClient implements EventClient, EventClientAdmin {
  constructor(private client: NatsClient) {}

  isConnected(): boolean {
    return this.client.isConnected()
  }

  async publishEvent(params: {
    workspaceId: string
    eventType: string
    payload: Record<string, unknown>
    timeoutMs?: number
  }): Promise<void> {
    const { workspaceId, eventType, payload, timeoutMs = 5000 } = params

    // Ensure stream exists for this workspace (cached)
    const streamName = `workspace-${workspaceId}`
    await this.client.createStream({
      name: streamName,
      subjects: [`workspace.${workspaceId}.events.*`],
      description: `Events for workspace ${workspaceId}`,
    })

    // Publish event
    const subject = `workspace.${workspaceId}.events.${eventType}`
    await this.client.publish({
      subject,
      payload: JSON.stringify(payload),
      timeout: timeoutMs,
    })
  }

  async subscribe(params: {
    workspaceId: string
    eventType: string
    consumerName: string
    handler: (payload: Record<string, unknown>) => Promise<void>
  }): Promise<() => Promise<void>> {
    const { workspaceId, eventType, consumerName, handler } = params

    return await this.client.subscribe({
      workspaceId,
      consumerName,
      eventType,
      handler: async (data: Uint8Array<ArrayBufferLike>) => {
        const payload = JSON.parse(new TextDecoder().decode(data))
        await handler(payload)
      },
    })
  }

  async request<TRequest = Record<string, unknown>, TResponse = Record<string, unknown>>(params: {
    subject: string
    payload: TRequest
    timeoutMs?: number
  }): Promise<TResponse> {
    const { subject, payload, timeoutMs = 30000 } = params

    const nc = this.client.getConnection()
    if (!nc) {
      throw new Error('Not connected to event service')
    }

    const response = await nc.request(subject, new TextEncoder().encode(JSON.stringify(payload)), {
      timeout: timeoutMs,
    })

    return JSON.parse(new TextDecoder().decode(response.data)) as TResponse
  }

  async respond<TRequest = Record<string, unknown>, TResponse = Record<string, unknown>>(params: {
    subject: string
    handler: (payload: TRequest) => Promise<TResponse>
  }): Promise<() => Promise<void>> {
    const { subject, handler } = params

    const nc = this.client.getConnection()
    if (!nc) {
      throw new Error('Not connected to event service')
    }

    const sub = nc.subscribe(subject, {
      callback: async (err, msg) => {
        if (err) {
          console.error(`Error in ${subject} handler:`, err)
          return
        }

        try {
          const request = JSON.parse(new TextDecoder().decode(msg.data)) as TRequest
          const response = await handler(request)
          msg.respond(new TextEncoder().encode(JSON.stringify(response)))
        } catch (error) {
          const errorResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
          msg.respond(new TextEncoder().encode(JSON.stringify(errorResponse)))
        }
      },
    })

    // Return cleanup function
    return async () => {
      sub.unsubscribe()
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect()
  }

  // Admin operations
  async deleteWorkspaceStream(workspaceId: string): Promise<void> {
    const jsm = this.client.getJetStreamManager()
    if (!jsm) {
      throw new Error('Not connected to event service')
    }

    const streamName = `workspace-${workspaceId}`
    await jsm.streams.delete(streamName)
    console.log(`Deleted stream: ${streamName}`)
  }

  async deleteConsumer(workspaceId: string, consumerName: string): Promise<void> {
    const jsm = this.client.getJetStreamManager()
    if (!jsm) {
      throw new Error('Not connected to event service')
    }

    const streamName = `workspace-${workspaceId}`
    await jsm.consumers.delete(streamName, consumerName)
    console.log(`Deleted consumer: ${consumerName} from stream: ${streamName}`)
  }
}
