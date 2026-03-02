import {
  AckPolicy,
  type ConnectionOptions,
  DeliverPolicy,
  type JetStreamClient,
  type JetStreamManager,
  type NatsConnection,
  RetentionPolicy,
  StorageType,
  connect,
  createInbox,
} from 'nats'

import { createLogger, matchGlobPattern } from '@george-ai/app-commons'

import { EventClient, EventClientConfig } from './event-client'

const logger = createLogger('NATS Client')

/**
 * NATS JetStream client for George AI events
 */
export class NatsClient implements EventClient {
  private nc: NatsConnection | null = null
  private js: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null

  /**
   * Connect to NATS server
   */
  async connect(config: EventClientConfig): Promise<void> {
    const options: ConnectionOptions = {
      servers: config.servers,
      user: config.user,
      pass: config.pass,
      token: config.token,
    }

    this.nc = await connect(options)
    this.js = this.nc.jetstream()
    this.jsm = await this.nc.jetstreamManager()

    logger.info(`Connected to NATS server: ${this.nc.getServer()}`)
  }

  /**
   * Disconnect from NATS server
   */
  async disconnect(): Promise<void> {
    if (this.nc) {
      await this.nc.drain()
      await this.nc.close()
      this.nc = null
      this.js = null
      this.jsm = null
      logger.info('Disconnected from NATS server')
    }
  }

  async isConnected(): Promise<boolean> {
    return this.nc !== null && !this.nc.isClosed()
  }

  async ensureWorkerStream(args: { streamName: string; subjects: string[]; description?: string }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, subjects, description } = args

    const existingStream = await this.jsm.streams.info(streamName).catch(() => null)
    if (!existingStream) {
      logger.info('Creating stream', { streamName, subjects, description })
      await this.jsm.streams.add({
        name: streamName,
        subjects,
        description,
        retention: RetentionPolicy.Workqueue,
        max_age: 0,
        max_msgs: -1, // unlimited
        max_bytes: -1, // unlimited
        storage: StorageType.File,
      })
    } else {
      const existingSubjects = existingStream.config.subjects.sort().join(',')
      const desiredSubjects = subjects.sort().join(',')
      logger.debug('Stream already exists', { streamName, existingSubjects, desiredSubjects, description })

      if (existingSubjects !== desiredSubjects) {
        logger.info('Stream subjects mismatch', {
          streamName,
          existingSubjects,
          desiredSubjects,
        })
        await this.jsm.streams.update(streamName, {
          subjects,
        })
      }
      if (description && existingStream.config.description !== description) {
        logger.info('Stream description mismatch', {
          streamName,
          existingDescription: existingStream.config.description,
          desiredDescription: description,
        })
        await this.jsm.streams.update(streamName, {
          description,
        })
      }
    }
  }

  async deleteStream(name: string): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    await this.jsm.streams.delete(name).catch((err) => {
      logger.error(`Error deleting stream ${name}:`, err)
      throw err
    })
    logger.info(`Deleted stream: ${name}`)
  }

  async getStream(
    streamName: string,
  ): Promise<{ name: string; subjects: string[]; description?: string; persist: boolean } | null> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const streamInfo = await this.jsm.streams.info(streamName).catch(() => null)
    if (!streamInfo) {
      return null
    }

    return {
      name: streamInfo.config.name,
      subjects: streamInfo.config.subjects,
      description: streamInfo.config.description,
      persist: streamInfo.config.retention === RetentionPolicy.Limits,
    }
  }

  async purgeStream(params: { streamName: string; subjectFilter: string }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, subjectFilter } = params

    await this.jsm.streams.purge(streamName, {
      filter: subjectFilter,
    })
  }

  async ensureConsumer(params: {
    consumerName: string
    streamName: string
    subjectFilters: string[]
    timeoutMs: number
    maxPendingMessages: number
    maxDeliveryAttempts: number
  }): Promise<void> {
    if (!this.jsm || !this.js) {
      throw new Error('Not connected to NATS')
    }

    const { consumerName, streamName, subjectFilters, timeoutMs, maxPendingMessages, maxDeliveryAttempts } = params

    logger.debug('Ensuring consumer', { consumerName, subjectFilters, streamName })

    let consumerInfo = await this.jsm.consumers.info(streamName, consumerName).catch(() => null)
    if (!consumerInfo) {
      consumerInfo = await this.jsm.consumers.add(streamName, {
        durable_name: consumerName,
        filter_subjects: subjectFilters,
        deliver_policy: DeliverPolicy.All,
        ack_policy: AckPolicy.Explicit,
        max_ack_pending: maxPendingMessages,
        max_deliver: maxDeliveryAttempts,
        ack_wait: timeoutMs * 1e6, // convert ms to nanoseconds
      })
      await this.jsm.consumers.pause(
        streamName,
        consumerInfo.name,
        new Date(Date.now() + 1000 * 365 * 24 * 60 * 60 * 1000), // nats error using undefined - 1000 years should be enough
      ) // Start paused by default
      logger.debug('Created new consumer', { consumerName, streamName, consumerInfo })
    } else {
      const existingSubjects = consumerInfo.config.filter_subjects?.sort().join(',') || ''
      const desiredSubjects = subjectFilters.sort().join(',')
      if (
        existingSubjects === desiredSubjects &&
        consumerInfo.config.max_ack_pending === (params.maxPendingMessages || 1000) &&
        consumerInfo.config.max_deliver === (params.maxDeliveryAttempts || 3)
      ) {
        return
      }
      await this.jsm.consumers.update(streamName, consumerName, {
        filter_subjects: subjectFilters,
        max_ack_pending: params.maxPendingMessages,
        max_deliver: params.maxDeliveryAttempts,
        ack_wait: timeoutMs * 1e6, // 30 seconds
      })
      logger.debug('Updated existing consumer', {
        consumerName,
        streamName,
        consumerInfo,
        subjectFilters,
        maxPendingMessages,
        maxDeliveryAttempts,
      })
    }
  }

  async pauseConsumer({ streamName, consumerName }: { streamName: string; consumerName: string }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const consumerInfo = await this.jsm.consumers.info(streamName, consumerName)

    try {
      await this.jsm.consumers.pause(
        streamName,
        consumerInfo.name,
        new Date(Date.now() + 1000 * 365 * 24 * 60 * 60 * 1000), // nats error using undefined - 1000 years should be enough
      )
    } catch (error) {
      logger.error('Error pausing consumer', { error, consumerName, streamName })
      throw error
    }

    logger.debug('Consumer paused', { consumerName, streamName })
  }

  async resumeConsumer({ streamName, consumerName }: { streamName: string; consumerName: string }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const consumerInfo = await this.jsm.consumers.info(streamName, consumerName)

    logger.debug('Resuming consumer', {
      consumerName,
      streamName,
      consumersubjects: JSON.stringify(consumerInfo.config.filter_subjects),
    })

    try {
      await this.jsm.consumers.resume(streamName, consumerInfo.name)
    } catch (error) {
      logger.error('Error resuming consumer', { error, consumerName, streamName })
      throw error
    }
    logger.debug('Consumer resumed', { consumerName, streamName })
  }

  async consumerStatus({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<'paused' | 'running'> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const consumerInfo = await this.jsm.consumers.info(streamName, consumerName)
    return consumerInfo.paused ? 'paused' : 'running'
  }

  async deleteConsumer(params: { streamName: string; consumerName: string }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, consumerName } = params

    await this.jsm.consumers.delete(streamName, consumerName).catch((error) => {
      logger.error('Error deleting consumer on stream ', { error, consumerName, streamName })
      throw error
    })
    logger.debug('Deleted consumer on stream', { consumerName, streamName })
  }

  async publish(params: {
    subject: string
    payload: Uint8Array<ArrayBufferLike>
    timeoutMs?: number
  }): Promise<{ streamName: string; msgId: string; inbox: string }> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { subject, payload, timeoutMs } = params

    const inbox = createInbox() // Generate a unique inbox string to allow replying if needed
    const msgID = crypto.randomUUID()
    // Publish to JetStream
    const ack = await this.js.publish(subject, payload, {
      msgID,
      timeout: timeoutMs ? timeoutMs : 5000,
    })

    return { streamName: ack.stream, msgId: msgID, inbox }
  }

  async startWorkerLoop(params: {
    streamName: string
    consumerGlobPattern: string
    handler: ({ subject, payload }: { subject: string; payload: Uint8Array<ArrayBufferLike> }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      logger.error('Cannot start worker loop, not connected to NATS', params)
      throw new Error('Not connected to NATS')
    }

    const { streamName, consumerGlobPattern, handler } = params

    const abortController = new AbortController()
    const signal = abortController.signal

    logger.debug('Starting worker loop', { streamName, consumerGlobPattern })
    const processingLoop = this.processWorkerLoop({ streamName, consumerGlobPattern, handler, signal }).catch(
      (error) => {
        logger.error('Error in worker processing loop', { error, params })
      },
    )

    // Return cleanup function
    return async () => {
      abortController.abort()
      await processingLoop
    }
  }

  private async processWorkerLoop(parameters: {
    streamName: string
    consumerGlobPattern: string
    signal: AbortSignal
    handler: ({ subject, payload }: { subject: string; payload: Uint8Array<ArrayBufferLike> }) => Promise<void>
  }): Promise<void> {
    if (!this.js || !this.jsm) {
      logger.error('Cannot process worker loop, not connected to NATS', { parameters })
      throw new Error('Not connected to NATS')
    }
    const { streamName, consumerGlobPattern, signal, handler } = parameters
    while (true) {
      if (signal.aborted) {
        logger.debug('Worker loop aborted', { parameters })
        break
      }
      const consumers = await this.jsm.consumers.list(streamName).next()
      logger.debug('Fetched consumers', { streamName, consumersCount: consumers.length })
      // Filter and randomize to prevent workers from all hitting the same consumer first
      const shuffledConsumers = consumers
        .filter((c) => matchGlobPattern(c.name, consumerGlobPattern) && !c.paused)
        .sort(() => Math.random() - 0.5)

      logger.debug('Processing consumers', { streamName, consumerGlobPattern, consumers: shuffledConsumers.length })

      for (const consumerInfo of shuffledConsumers) {
        if (signal.aborted) {
          logger.debug('Worker loop aborted', { streamName, consumerGlobPattern })
          break
        }
        if (consumerInfo.paused) {
          logger.debug('Skipping paused consumer', { streamName, consumerName: consumerInfo.name })
          continue
        }
        if (consumerInfo.num_pending === 0) {
          logger.debug('No pending messages for consumer, skipping', { streamName, consumerName: consumerInfo.name })
          continue
        }
        const consumer = await this.js.consumers.get(streamName, consumerInfo.name)

        logger.debug('Fetching message for consumer', { streamName, consumerName: consumerInfo.name })
        try {
          const messages = await consumer.fetch({ max_messages: 10, expires: 1000 })

          for await (const msg of messages) {
            if (signal.aborted) {
              logger.debug('Worker loop aborted', { streamName, consumerName: consumerInfo.name })
              break
            }
            logger.debug('Received message for consumer', {
              streamName,
              subject: msg.subject,
              consumerName: consumerInfo.name,
            })
            try {
              // Call handler
              await handler({ subject: msg.subject, payload: msg.data })
              // Acknowledge message
              msg.ack()
              logger.debug('Message processed and acknowledged', {
                streamName,
                subject: msg.subject,
                consumerName: consumerInfo.name,
              })
            } catch (error) {
              if (msg.info.deliveryCount >= (consumerInfo.config.max_deliver || 3)) {
                // Log and drop the message
                logger.error('Message reached max delivery attempts, dropping message', {
                  streamName,
                  consumerName: consumerInfo.name,
                  subject: msg.subject,
                  error,
                })

                // Acknowledge to drop the message
                msg.ack()
              }
              logger.error('Error processing event - will be redelivered', {
                streamName,
                consumerName: consumerInfo.name,
                subject: msg.subject,
                error,
              })
              // Negative acknowledge to retry later
              msg.nak()
            }
          }
        } catch (error) {
          logger.debug('no message available', { error, streamName, consumerName: consumerInfo.name })
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Prevent tight loop
    }
  }

  async subscribe(params: {
    consumerName: string
    streamName: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { consumerName, streamName, handler } = params

    const stream = await this.getStream(streamName)

    if (!stream) {
      throw new Error(`Stream does not exist: ${streamName}`)
    }

    const consumer = await this.js.consumers.get(streamName, consumerName)
    const messages = await consumer.consume()

    // Process messages
    const processMessages = async () => {
      for await (const msg of messages) {
        try {
          // Call handler
          await handler(msg.data)

          // Acknowledge message
          msg.ack()
        } catch (error) {
          logger.error(`Error processing event:`, { error, streamName, consumerName })
          // Negative acknowledge to retry later
          msg.nak()
        }
      }
    }

    // Start processing in background
    processMessages().catch((error) => {
      logger.error('Error in message processing loop', { error, streamName, consumerName })
    })

    // Return cleanup function
    return async () => {
      await messages.close()
    }
  }

  async getStreamStatistics(params: {
    consumerName: string
    streamName: string
  }): Promise<{ totalMessages: number; processedMessages: number; pendingMessages: number }> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, consumerName } = params

    const consumer = await this.js.consumers.get(streamName, consumerName)
    const consumerInfo = await consumer.info(true)
    const streamInfo = await this.jsm.streams.info(streamName)
    const stats = {
      totalMessages: streamInfo.state.messages,
      processedMessages: consumerInfo.ack_floor.stream_seq,
      pendingMessages: consumerInfo.num_pending,
      inProgressMessages: consumerInfo.num_ack_pending,
      paused: consumerInfo.paused,
      failedMessages: consumerInfo.ack_floor.stream_seq - consumerInfo.num_ack_pending - consumerInfo.num_pending,
    }
    return stats
  }

  async getMessages(parameters: {
    streamName: string
    subjectFilter: string
    startSequence?: number
    take?: number
  }): Promise<{
    rawMessages: Array<{ id: string; subject: string; deliveryCount: number; data: Uint8Array<ArrayBufferLike> }>
    totalCount: number
    lastSequence: number
  }> {
    if (!this.js || !this.jsm) {
      logger.error('Cannot get messages, not connected to NATS', { parameters })
      throw new Error('Not connected to NATS')
    }
    const { streamName, subjectFilter, startSequence, take = 20 } = parameters

    // Get accurate total count from stream info
    const streamInfo = await this.jsm.streams.info(streamName, {
      subjects_filter: subjectFilter,
    })

    const totalCount = Object.values(streamInfo.state.subjects ?? {}).reduce((sum, count) => sum + count, 0)

    if (totalCount < 1) {
      return { rawMessages: [], totalCount: 0, lastSequence: startSequence ?? 0 }
    }

    const consumer = await this.js.consumers.get(streamName, {
      filterSubjects: [subjectFilter],
      ...(startSequence ? { opt_start_seq: startSequence } : {}),
    })

    const messages: { id: string; subject: string; deliveryCount: number; data: Uint8Array<ArrayBufferLike> }[] = []

    let lastSequence = startSequence ?? 0

    const max_messages = Math.min(take, totalCount) // Ensure we don't request more messages than exist

    const fetchBatch = await consumer.fetch({ max_messages, expires: 1000 })

    for await (const msg of fetchBatch) {
      lastSequence = msg.info.streamSequence
      logger.debug('Fetched message', { streamName, msg, lastSequence })
      messages.push({
        id: msg.info.streamSequence.toString(),
        subject: msg.subject,
        deliveryCount: msg.info.deliveryCount,
        data: msg.data,
      })
      if (messages.length >= max_messages) {
        break
      }
    }

    return { rawMessages: messages, totalCount, lastSequence }
  }

  async request(params: {
    subject: string
    payload: Uint8Array<ArrayBufferLike>
    timeoutMs?: number
  }): Promise<Uint8Array<ArrayBufferLike>> {
    const { subject, payload, timeoutMs = 30000 } = params

    if (!this.nc) {
      throw new Error('Not connected to event service')
    }

    const response = await this.nc
      .request(subject, payload, {
        timeout: timeoutMs,
      })
      .catch((error) => {
        logger.error('Error in request', { error, subject })
        if (error.message === '503') {
          throw new Error('No responders available for subject: ' + subject)
        }
        throw error
      })

    return response.data
  }

  async respond(params: {
    subject: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<Uint8Array<ArrayBufferLike>>
  }): Promise<() => Promise<void>> {
    const { subject, handler } = params

    if (!this.nc) {
      throw new Error('Not connected to event service')
    }

    const sub = this.nc.subscribe(subject, {
      callback: async (err, msg) => {
        if (err) {
          logger.error('Error in subject handler', { error: err, subject })
          return
        }

        try {
          const request = msg.data
          const response = await handler(request)
          msg.respond(response)
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

  async ensureBucket(params: { name: string; options?: { ttlMs?: number; history?: number } }): Promise<void> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { name, options } = params

    const jsm = await this.js.jetstreamManager()
    const streamName = `KV_${name}`
    const ttlNanoseconds = options?.ttlMs ? options.ttlMs * 1_000_000 : 0

    try {
      const info = await jsm.streams.info(streamName)

      await jsm.streams.update(streamName, {
        ...info.config,
        max_age: ttlNanoseconds,
        max_msgs_per_subject: options?.history || 1,
        allow_rollup_hdrs: true,
      })
      logger.debug('Updated existing bucket stream with new configuration', { name, options })
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        const errorCode = 'code' in error ? error.code : null
        if (errorCode === '404') {
          await this.js.views.kv(name, {
            history: options?.history || 0,
            ttl: options?.ttlMs ? options.ttlMs : 0,
            storage: StorageType.Memory,
          })
          logger.info('Created new bucket stream', { name, options })
        } else {
          logger.error('Error ensuring bucket stream', { error, name, options })
          throw error
        }
      } else {
        logger.error('Unknown error ensuring bucket stream', { error, name, options })
        throw error
      }
    }
  }

  async getBucketKeys(params: { bucketName: string; filter?: string; limit?: number }): Promise<string[]> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, limit, filter } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const keys = await kvBucket.keys(filter)
    const result: string[] = []
    for await (const key of keys) {
      if (limit && result.length >= limit) {
        break
      }
      result.push(key)
    }

    return result
  }

  async putBucketEntry(params: { bucketName: string; key: string; value: Uint8Array<ArrayBufferLike> }): Promise<void> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key, value } = params

    const kvBucket = await this.js.views.kv(bucketName)

    await kvBucket.put(key, value)
  }

  async getBucketEntry(params: { bucketName: string; key: string }): Promise<Uint8Array<ArrayBufferLike> | null> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const entry = await kvBucket.get(key).catch(() => null)
    if (!entry || entry.value.length === 0) {
      return null
    }

    return entry.value
  }

  async watchBucket(params: {
    bucketName: string
    key: string
    handler: (handlerParams: {
      key: string
      operation: 'update' | 'delete'
      value: Uint8Array<ArrayBufferLike>
    }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key, handler } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const watcher = await kvBucket.watch({ key })

    const processBucketWatch = async () => {
      for await (const entry of watcher) {
        if (entry.operation !== 'DEL' && entry.operation !== 'PURGE' && (!entry.value || entry.value.length === 0)) {
          // Treat empty value as delete
          logger.warn('Received empty bucket entry - will be ignored', { bucketName, key, entry })
          continue
        }
        await handler({
          key: entry.key,
          operation: entry.operation === 'DEL' || entry.operation === 'PURGE' ? 'delete' : 'update',
          value: entry.value,
        }).catch((error) => {
          logger.error('Error in bucket watch handler', {
            error,
            bucketName,
            key,
            entry,
            value: new TextDecoder().decode(entry.value),
          })
        })
      }
    }

    // Start processing in background
    processBucketWatch()
    // Return cleanup function - promisify for non-blocking
    return () => {
      return new Promise((resolve, reject) => {
        try {
          watcher.stop()
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
  }

  async deleteBucketEntry(params: { bucketName: string; key: string }): Promise<void> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key } = params

    const kvBucket = await this.js.views.kv(bucketName)

    await kvBucket.purge(key)
  }

  async getBucketStatus(params: { bucketName: string }): Promise<{
    valueCount: number
    maxEntriesPerKey: number
    ttlMs: number
  }> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const status = await kvBucket.status()

    return {
      valueCount: status.values,
      maxEntriesPerKey: status.history,
      ttlMs: status.ttl,
    }
  }
}
