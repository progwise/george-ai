/**
 * Event Service Client - Provider-agnostic event messaging interface
 *
 * Current implementation: NATS JetStream
 * Future: Can be switched to RabbitMQ, Kafka, etc. without breaking consumers
 */

/**
 * Event client interface - all consumers should use this, not NATS directly
 */
export interface EventClient {
  /**
   * Check if connected to event service
   */
  isConnected(): Promise<boolean>

  ensureStream(args: { streamName: string; subjects: string[]; description?: string; persist: boolean }): Promise<void>

  deleteStream(name: string): Promise<void>

  publish(params: {
    subject: string
    payload: Uint8Array<ArrayBufferLike>
    timeoutMs?: number
  }): Promise<{ streamName: string; msgId: string }>

  /**
   * Subscribe to workspace events with a consumer group
   * Returns cleanup function to stop consuming
   */

  subscribe(params: {
    subscriptionName: string
    streamName: string
    subjectFilter: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<void>
  }): Promise<() => Promise<void>>

  /**
   * Request/reply pattern for synchronous operations
   */
  request(params: {
    subject: string
    payload: Uint8Array<ArrayBufferLike>
    timeoutMs?: number
  }): Promise<Uint8Array<ArrayBufferLike>>

  /**
   * Respond to requests (for service workers)
   */
  respond(params: {
    subject: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<Uint8Array<ArrayBufferLike>>
  }): Promise<() => Promise<void>>

  /**
   * Disconnect from event service
   */
  disconnect(): Promise<void>
}
