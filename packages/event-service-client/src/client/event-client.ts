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

  getStreamStatistics(params: {
    streamName: string
    subjectFilter: string
  }): Promise<{ totalMessages: number; processedMessages: number; pendingMessages: number }>

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
    subjectFilters: string[]
    streamName: string
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

  ensureBucket(params: { name: string; options?: { ttlMs?: number; history?: number } }): Promise<void>

  put(params: { bucketName: string; key: string; value: Uint8Array<ArrayBufferLike> }): Promise<void>

  get(params: { bucketName: string; key: string }): Promise<Uint8Array<ArrayBufferLike> | null>

  watch(params: {
    bucketName: string
    key: string
    handler: (handlerParams: {
      key: string
      operation: 'create' | 'update' | 'delete'
      value: Uint8Array<ArrayBufferLike> | null
    }) => Promise<void>
  }): Promise<() => Promise<void>>

  /**
   * Disconnect from event service
   */
  disconnect(): Promise<void>
}
