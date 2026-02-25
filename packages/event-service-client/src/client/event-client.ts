export interface EventClientConfig {
  servers?: string | string[]
  user?: string
  pass?: string
  token?: string
}

export interface EventClient {
  isConnected(): Promise<boolean>

  ensureWorkerStream(args: { streamName: string; subjects: string[]; description?: string }): Promise<void>

  deleteStream(name: string): Promise<void>

  ensureConsumer(params: {
    streamName: string
    consumerName: string
    subjectFilters: string[]
    timeoutMs: number
    maxPendingMessages: number
    maxDeliveryAttempts: number
  }): Promise<void>

  deleteConsumer(params: { streamName: string; consumerName: string }): Promise<void>

  getStreamStatistics(params: {
    consumerName: string
    streamName: string
  }): Promise<{ totalMessages: number; processedMessages: number; pendingMessages: number }>

  publish(params: {
    subject: string
    payload: Uint8Array<ArrayBufferLike>
    timeoutMs?: number
  }): Promise<{ streamName: string; msgId: string; inbox: string }>

  startWorkerLoop(params: {
    streamName: string
    consumerGlobPattern: string
    handler: ({
      subject,
      payload,
      error,
    }: {
      subject: string
      payload: Uint8Array<ArrayBufferLike>
      error?: unknown
    }) => Promise<void>
  }): Promise<() => Promise<void>>

  subscribe(params: {
    streamName: string
    consumerName: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<void>
  }): Promise<() => Promise<void>>

  resumeConsumer({ streamName, consumerName }: { streamName: string; consumerName: string }): Promise<void>

  pauseConsumer({ streamName, consumerName }: { streamName: string; consumerName: string }): Promise<void>

  consumerStatus({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<'paused' | 'running'>

  getMessages(params: { streamName: string; subjectFilter: string; startSequence?: number; take?: number }): Promise<{
    rawMessages: Array<{ id: string; subject: string; deliveryCount: number; data: Uint8Array<ArrayBufferLike> }>
    totalCount: number
    lastSequence: number
  }>

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

  putBucketEntry(params: { bucketName: string; key: string; value: Uint8Array<ArrayBufferLike> }): Promise<void>

  getBucketEntry(params: { bucketName: string; key: string }): Promise<Uint8Array<ArrayBufferLike> | null>

  getBucketStatus(params: { bucketName: string }): Promise<{
    valueCount: number
    maxEntriesPerKey: number
    ttlMs: number
  }>

  watchBucket(params: {
    bucketName: string
    key: string
    handler: (handlerParams: {
      key: string
      operation: 'update' | 'delete'
      value: Uint8Array<ArrayBufferLike> | null
    }) => Promise<void>
  }): Promise<() => Promise<void>>

  deleteBucketEntry(params: { bucketName: string; key: string }): Promise<void>

  getBucketKeys(params: { bucketName: string; filter?: string; limit?: number }): Promise<string[]>
  /**
   * Disconnect from event service
   */
  disconnect(): Promise<void>
}
