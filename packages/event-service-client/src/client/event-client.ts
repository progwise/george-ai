import z from 'zod'

import { EventQueueStatus } from '@george-ai/app-schema'

export interface EventClientConfig {
  servers?: string | string[]
  user?: string
  pass?: string
  token?: string
}

export interface EventClient {
  isConnected(): Promise<boolean>

  matchesSubjectFilter(args: { subject: string; filter: string }): boolean

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
  purgeStream(params: { streamName: string; subjectFilter: string | string[] }): Promise<void>

  getStreamStatistics(params: {
    streamName: string
    subjectFilter?: string
  }): Promise<{ totalMessages: number; filteredMessages: number }>

  publish<T>(params: {
    subject: string
    event: T
    timeoutMs?: number
  }): Promise<{ streamName: string; msgId: string; inbox: string }>

  startWorkerLoop<T extends z.ZodTypeAny>(params: {
    schema: T
    streamName: string
    consumerGlobPattern: string
    handler: (params: { subject: string; event: z.infer<T> }) => Promise<void>
  }): Promise<() => Promise<void>>

  subscribe<T extends z.AnyZodObject>(params: {
    schema: T
    streamName: string
    consumerName: string
    handler: (params: { subject: string; event: z.infer<T> }) => Promise<void>
  }): Promise<() => Promise<void>>

  resumeConsumer({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<{ status: EventQueueStatus; delivered: number; redelivered: number; pending: number; waiting: number }>

  pauseConsumer({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<{ status: EventQueueStatus; delivered: number; redelivered: number; pending: number; waiting: number }>

  consumerStatus({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<{ status: EventQueueStatus; delivered: number; redelivered: number; pending: number; waiting: number }>

  getMessages<T extends z.ZodTypeAny>(parameters: {
    streamName: string
    schema: T
    subjectFilter: string
    startSequence?: number
    take?: number
  }): Promise<{
    messages: Array<{ sequence: number; subject: string; entry: z.infer<T> }>
    totalMessages: number
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
    handler: (subject: string, payload: Uint8Array<ArrayBufferLike>) => Promise<Uint8Array<ArrayBufferLike>>
  }): Promise<() => Promise<void>>

  ensureBucket(params: { name: string; options?: { ttlMs?: number; history?: number } }): Promise<void>

  deleteBucket(params: { name: string }): Promise<void>

  putBucketEntry<T>(params: {
    bucketName: string
    key: string
    item: T
    revision?: number
  }): Promise<{ revision: number }>

  getBucketEntry<T extends z.ZodTypeAny>(params: {
    bucketName: string
    key: string
    schema: T
  }): Promise<{ revision: number; value: z.infer<T> } | null>

  getBucketEntries<T extends z.ZodTypeAny>(params: {
    bucketName: string
    filter: string
    schema: T
  }): Promise<{ revision: number; key: string; value: z.infer<T> }[]>

  getBucketStatus(params: { bucketName: string }): Promise<{
    valueCount: number
    maxEntriesPerKey: number
    ttlMs: number
  }>

  watchBucket<T extends z.ZodTypeAny>(params: {
    bucketName: string
    filter: string | string[]
    schema: T
    handler: (handlerParams: {
      key: string
      operation: 'update' | 'delete'
      revision: number
      entry: z.infer<T> | null
    }) => Promise<void>
  }): Promise<() => Promise<void>>

  watchBucketKeys(params: {
    bucketName: string
    filter: string
    handler: (handlerParams: {
      key: string
      operation: 'update' | 'delete' | 'synced'
      revision: number
      stopWatching: () => void
    }) => Promise<void>
  }): Promise<() => Promise<void>>

  deleteBucketEntry(params: { bucketName: string; key: string }): Promise<void>

  deleteBucketEntries(params: { bucketName: string; filter: string | string[] }): Promise<void>

  getBucketKeys(params: { bucketName: string; filter?: string | string[] }): Promise<string[]>

  getBucketEntriesStats(params: {
    bucketName: string
    filter: string
  }): Promise<{ key: string; revision: number; created: Date }[]>

  disconnect(): Promise<void>
}
