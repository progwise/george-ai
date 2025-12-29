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
  isConnected(): boolean

  /**
   * Publish an event to a workspace
   */
  publishEvent(params: {
    workspaceId: string
    eventType: string
    payload: Record<string, unknown>
    timeoutMs?: number
  }): Promise<void>

  /**
   * Subscribe to workspace events with a consumer group
   * Returns cleanup function to stop consuming
   */
  subscribe(params: {
    workspaceId: string
    eventType: string
    consumerName: string
    handler: (payload: Record<string, unknown>) => Promise<void>
  }): Promise<() => Promise<void>>

  /**
   * Request/reply pattern for synchronous operations
   */
  request<TRequest = Record<string, unknown>, TResponse = Record<string, unknown>>(params: {
    subject: string
    payload: TRequest
    timeoutMs?: number
  }): Promise<TResponse>

  /**
   * Respond to requests (for service workers)
   */
  respond<TRequest = Record<string, unknown>, TResponse = Record<string, unknown>>(params: {
    subject: string
    handler: (payload: TRequest) => Promise<TResponse>
  }): Promise<() => Promise<void>>

  /**
   * Disconnect from event service
   */
  disconnect(): Promise<void>
}

/**
 * Workspace management operations
 */
export interface EventClientAdmin {
  /**
   * get workspace streams
   */
  getWorkspaceStreams(): Promise<string[]>

  /**
   * Delete a workspace's event stream
   */
  deleteWorkspaceStream(workspaceId: string): Promise<void>

  /**
   * Delete a specific consumer from a workspace
   */
  deleteConsumer(workspaceId: string, consumerName: string): Promise<void>
}
