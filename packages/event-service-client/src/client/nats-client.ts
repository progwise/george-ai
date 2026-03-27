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
import z from 'zod'

import { createLogger, matchGlobPattern } from '@george-ai/app-commons'
import { EventQueueStatus } from '@george-ai/app-schema'

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

  matchesSubjectFilter(args: { subject: string; filter: string }): boolean {
    // subject =  kfz.motorrad.bmw.enduro.gs1200
    // filter =   kfz.*.bmw.>

    const { subject, filter } = args

    const subjectParts = subject.split('.')
    const filterParts = filter.split('.')

    let i = 0
    while (i < filterParts.length) {
      if (filterParts[i] === '>') {
        return true
      }

      if (i > subjectParts.length) {
        return false
      }

      if (filterParts[i] !== '*' && filterParts[i] !== subjectParts[i]) {
        return false
      }
      i = i + 1
    }

    return i === subjectParts.length
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
        logger.warn('Stream subjects mismatch', {
          streamName,
          existingSubjects,
          desiredSubjects,
        })
        await this.jsm.streams.update(streamName, {
          subjects,
        })
      }
      if (description && existingStream.config.description !== description) {
        logger.warn('Stream description mismatch', {
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
    logger.debug(`Deleted stream: ${name}`)
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

  async purgeStream(params: { streamName: string; subjectFilter: string | string[] }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, subjectFilter } = params

    if (Array.isArray(subjectFilter)) {
      await Promise.all(subjectFilter.map((filter) => this.jsm!.streams.purge(streamName, { filter })))
    } else {
      await this.jsm.streams.purge(streamName, {
        filter: subjectFilter,
      })
    }
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
      logger.info('Created new consumer', {
        consumerName,
        streamName,
        consumerInfo: JSON.stringify(consumerInfo),
        subjectFilters,
        maxPendingMessages,
        maxDeliveryAttempts,
      })
    } else {
      const existingSubjects = consumerInfo.config.filter_subjects?.sort().join(',') || ''
      const desiredSubjects = subjectFilters.sort().join(',')
      if (
        existingSubjects === desiredSubjects &&
        consumerInfo.config.max_ack_pending === (params.maxPendingMessages || 1000) &&
        consumerInfo.config.max_deliver === (params.maxDeliveryAttempts || 3)
      ) {
        logger.debug('Consumer already exists with matching configuration', {
          consumerName,
          streamName,
          existingSubjects,
          desiredSubjects,
        })
        return
      }
      await this.jsm.consumers.update(streamName, consumerName, {
        filter_subjects: subjectFilters,
        max_ack_pending: params.maxPendingMessages,
        max_deliver: params.maxDeliveryAttempts,
        ack_wait: timeoutMs * 1e6, // 30 seconds
      })
      logger.info('Updated existing consumer', {
        consumerName,
        streamName,
        consumerInfo: JSON.stringify(consumerInfo),
        subjectFilters,
        maxPendingMessages,
        maxDeliveryAttempts,
      })
    }
  }

  async pauseConsumer({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<{ status: EventQueueStatus; delivered: number; redelivered: number; pending: number; waiting: number }> {
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

    return {
      status: 'paused',
      delivered: consumerInfo.delivered.consumer_seq,
      pending: consumerInfo.num_pending,
      redelivered: consumerInfo.num_redelivered,
      waiting: consumerInfo.num_waiting,
    }
  }

  async resumeConsumer({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<{ status: EventQueueStatus; delivered: number; redelivered: number; pending: number; waiting: number }> {
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
    return {
      status: 'running',
      delivered: consumerInfo.delivered.consumer_seq,
      pending: consumerInfo.num_pending,
      redelivered: consumerInfo.num_redelivered,
      waiting: consumerInfo.num_waiting,
    }
  }

  async consumerStatus({
    streamName,
    consumerName,
  }: {
    streamName: string
    consumerName: string
  }): Promise<{ status: EventQueueStatus; delivered: number; redelivered: number; pending: number; waiting: number }> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const consumerInfo = await this.jsm.consumers.info(streamName, consumerName)
    return {
      delivered: consumerInfo.delivered.consumer_seq,
      pending: consumerInfo.num_pending,
      redelivered: consumerInfo.num_redelivered,
      waiting: consumerInfo.num_waiting,
      status: consumerInfo.paused ? 'paused' : 'running',
    }
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
    logger.info('Deleted consumer on stream', { consumerName, streamName })
  }

  async publish<T>(params: {
    subject: string
    event: T
    timeoutMs?: number
  }): Promise<{ streamName: string; msgId: string; inbox: string }> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { subject, event, timeoutMs } = params

    const inbox = createInbox() // Generate a unique inbox string to allow replying if needed
    const msgID = crypto.randomUUID()

    const payload = new TextEncoder().encode(JSON.stringify(event))
    // Publish to JetStream
    const ack = await this.js.publish(subject, payload, {
      msgID,
      timeout: timeoutMs ? timeoutMs : 5000,
    })

    return { streamName: ack.stream, msgId: msgID, inbox }
  }

  async startWorkerLoop<T extends z.ZodTypeAny>(params: {
    schema: T
    streamName: string
    consumerGlobPattern: string
    handler: (params: { subject: string; event: z.infer<T> }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      logger.error('Cannot start worker loop, not connected to NATS', params)
      throw new Error('Not connected to NATS')
    }

    const { schema, streamName, consumerGlobPattern, handler } = params

    const abortController = new AbortController()
    const signal = abortController.signal

    logger.debug('Starting worker loop', { streamName, consumerGlobPattern })
    const processingLoop = this.processWorkerLoop({ schema, streamName, consumerGlobPattern, handler, signal }).catch(
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

  private async processWorkerLoop<T extends z.ZodTypeAny>(parameters: {
    schema: T
    streamName: string
    consumerGlobPattern: string
    handler: (params: { subject: string; event: z.infer<T> }) => Promise<void>
    signal: AbortSignal
  }): Promise<void> {
    if (!this.js || !this.jsm) {
      logger.error('Cannot process worker loop, not connected to NATS', { parameters })
      throw new Error('Not connected to NATS')
    }
    const { schema, streamName, consumerGlobPattern, signal, handler } = parameters

    // TODO: use consumer.consume() instead for event-driven handling
    while (true) {
      if (signal.aborted) {
        logger.debug('Worker loop aborted', { parameters })
        break
      }
      const consumers = await this.jsm.consumers
        .list(streamName)
        .next()
        .catch((error) => {
          logger.warn('Error awaiting consumer list for stream in processsWorker loop. Will retry.', {
            error,
            streamName,
          })
          return []
        })
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
        const consumer = await this.js.consumers.get(streamName, consumerInfo.name)

        logger.debug('Fetching message for consumer', {
          streamName,
          consumerName: consumerInfo.name,
          subjects: consumerInfo.config.filter_subjects,
          pending: consumerInfo.num_pending,
        })
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
              consumerSUbjects: consumerInfo.config.filter_subjects,
            })

            try {
              const raw = new TextDecoder().decode(msg.data)
              const json = JSON.parse(raw)
              const event = schema.parse(json)
              // Call handler
              await handler({ subject: msg.subject, event })
              // Acknowledge message
              msg.ack()
              logger.debug('Message processed and acknowledged', {
                streamName,
                subject: msg.subject,
                consumerName: consumerInfo.name,
              })
            } catch (error) {
              if (error instanceof SyntaxError || error instanceof z.ZodError) {
                logger.error('Permanent error: malformed payload - removing from stream', { msg, error: error.message })
                msg.ack() // ACK - stop trying
              } else if (msg.info.deliveryCount >= (consumerInfo.config.max_deliver || 3)) {
                // Log and drop the message
                logger.error('Message reached max delivery attempts, dropping message', {
                  streamName,
                  consumerName: consumerInfo.name,
                  subject: msg.subject,
                  error,
                })
                msg.ack() // ACK - stop trying
              } else {
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
          }
        } catch (error) {
          logger.debug('no message available', { error, streamName, consumerName: consumerInfo.name })
        }
        // Yield to the event loop between consumers to allow GC to run
        await new Promise((resolve) => setImmediate(resolve))
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Prevent tight loop
    }
  }

  async subscribe<T extends z.AnyZodObject>(params: {
    schema: T
    consumerName: string
    streamName: string
    handler: (params: { subject: string; event: z.infer<T> }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { schema, consumerName, streamName, handler } = params

    const stream = await this.getStream(streamName)

    if (!stream) {
      throw new Error(`Stream does not exist: ${streamName}`)
    }

    const consumerInfo = await this.jsm.consumers.info(streamName, consumerName)
    const consumer = await this.js.consumers.get(streamName, consumerName)
    const messages = await consumer.consume()

    // Process messages
    const processMessages = async () => {
      for await (const msg of messages) {
        try {
          const raw = new TextDecoder().decode(msg.data)
          const json = JSON.parse(raw)
          const event = schema.parse(json)
          // Call handler
          await handler({ subject: msg.subject, event })
          // Acknowledge message
          msg.ack()
          logger.debug('Message processed and acknowledged', {
            streamName,
            subject: msg.subject,
          })
        } catch (error) {
          if (error instanceof SyntaxError || error instanceof z.ZodError) {
            logger.error('Permanent error: malformed payload - removing from stream', { msg, error: error.message })
            msg.ack() // ACK - stop trying
            return
          }
          if (msg.info.deliveryCount >= (consumerInfo.config.max_deliver || 3)) {
            // Log and drop the message
            logger.error('Message reached max delivery attempts, dropping message', {
              streamName,
              consumerName: consumerInfo.name,
              subject: msg.subject,
              error,
            })
            msg.ack() // ACK - stop trying
            return
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
    streamName: string
    subjectFilter?: string
  }): Promise<{ totalMessages: number; filteredMessages: number }> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, subjectFilter } = params

    const streamInfo = await this.jsm.streams.info(streamName, {
      subjects_filter: subjectFilter,
    })

    return {
      totalMessages: streamInfo.state.messages,
      filteredMessages: streamInfo.state.subjects ? Object.keys(streamInfo.state.subjects).length : 0,
    }
  }

  async getMessages<T extends z.ZodTypeAny>(parameters: {
    streamName: string
    schema: T
    subjectFilter: string
    startSequence?: number
    take?: number
  }): Promise<{
    messages: Array<{ sequence: number; subject: string; entry: z.infer<T> }>
    totalMessages: number
    lastSequence: number
  }> {
    if (!this.js || !this.jsm) {
      logger.error('Cannot get messages, not connected to NATS', { parameters })
      throw new Error('Not connected to NATS')
    }
    const { schema, streamName, subjectFilter, startSequence = 1, take = 20 } = parameters

    const streamInfo = await this.jsm.streams.info(streamName, {
      subjects_filter: subjectFilter,
    })

    const totalMessages = streamInfo.state.subjects ? Object.keys(streamInfo.state.subjects).length : 0

    const messages: { sequence: number; subject: string; entry: z.infer<T> }[] = []
    const textDecoder = new TextDecoder()

    const firstSeq = streamInfo.state.first_seq
    const lastSeq = streamInfo.state.last_seq

    let currentSequence = Math.max(startSequence, firstSeq)

    while (messages.length < take && currentSequence <= lastSeq) {
      try {
        const msg = await this.jsm.streams.getMessage(streamName, { seq: currentSequence })
        if (this.matchesSubjectFilter({ subject: msg.subject, filter: subjectFilter })) {
          const raw = textDecoder.decode(msg.data)
          const json = JSON.parse(raw)
          const entry = schema.parse(json)

          messages.push({
            sequence: msg.seq,
            subject: msg.subject,
            entry,
          })
        }
      } catch (error) {
        logger.warn('error parsing msg', { error, schema })
      }
      currentSequence++
    }

    return { messages, totalMessages, lastSequence: currentSequence - 1 }
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
    handler: (subject: string, payload: Uint8Array<ArrayBufferLike>) => Promise<Uint8Array<ArrayBufferLike>>
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
          const subject = msg.subject
          const request = msg.data
          const response = await handler(subject, request)
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

  async deleteBucket(params: { name: string }): Promise<void> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const kvBucket = await this.js.views.kv(params.name)
    await kvBucket.destroy()

    logger.info('Deleted bucket', params)
  }

  async putBucketEntry<T>(params: {
    bucketName: string
    key: string
    item: T
    revision?: number
  }): Promise<{ revision: number }> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key, item, revision } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const value = new TextEncoder().encode(JSON.stringify(item))

    const putResult = await kvBucket.put(key, value, { previousSeq: revision }).catch((error) => {
      logger.error('Error putting bucket entry', { error, bucketName, key, revision })
      throw error
    })
    return { revision: putResult }
  }

  async getBucketEntry<T>(params: {
    bucketName: string
    key: string
    schema: z.ZodSchema<T>
  }): Promise<{ revision: number; value: T } | null> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key, schema } = params

    const kvBucket = await this.js.views.kv(bucketName)

    let latest: { revision: number; value: T } | null = null

    try {
      const history = await kvBucket.history({ key })

      for await (const entry of history) {
        const isDelete = entry.operation === 'DEL' || entry.operation === 'PURGE'
        if (isDelete) {
          latest = null
          continue
        }

        if (!entry.value || entry.value.length < 1) {
          continue
        }

        try {
          const raw = new TextDecoder().decode(entry.value)
          const json = JSON.parse(raw)
          const parsed = schema.parse(json)
          latest = { revision: entry.revision, value: parsed }
        } catch (error) {
          logger.error('Corrupt history entry', { bucketName, error, entry, schema })
          return null
        }
      }
    } catch (error) {
      logger.warn('Error reading the history', { bucketName, key, schema, error })
      return null
    }
    return latest
  }

  async getBucketEntries<T>(params: {
    bucketName: string
    filter: string
    schema: z.ZodSchema<T>
  }): Promise<{ revision: number; key: string; value: T }[]> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, filter, schema } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const latestEntries = new Map<string, { revision: number; key: string; value: T }>()

    const decoder = new TextDecoder()

    const history = await kvBucket.history({ key: filter })

    for await (const entry of history) {
      if (!entry) {
        continue
      }
      const isDelete = entry.operation === 'DEL' || entry.operation === 'PURGE'
      if (isDelete) {
        latestEntries.delete(entry.key)
        continue
      }

      if (!entry.value || entry.value.length < 1) {
        continue
      }

      try {
        const raw = decoder.decode(entry.value)
        const json = JSON.parse(raw)
        const parsed = schema.parse(json)
        latestEntries.set(entry.key, { key: entry.key, revision: entry.revision, value: parsed })
      } catch (error) {
        logger.warn('Bucket entry could not be parsed, skipping', { bucketName, entry, error })
      }
    }

    return Array.from(latestEntries.values())
  }

  async getBucketKeys(params: { bucketName: string; filter?: string | string[] }): Promise<string[]> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, filter } = params

    const result: string[] = []

    const kvBucket = await this.js.views.kv(bucketName)

    try {
      const keys = await kvBucket.keys(filter)
      for await (const key of keys) {
        result.push(key)
      }
    } catch (error) {
      logger.error('error getting bucket keys', { bucketName, filter, error })
    }
    return result
  }

  async getBucketEntriesStats(params: {
    bucketName: string
    filter: string
  }): Promise<{ key: string; revision: number; created: Date }[]> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const latestByKeys = new Map<string, { key: string; revision: number; created: Date }>()
    const { bucketName, filter } = params

    const kvBucket = await this.js.views.kv(bucketName)
    const history = await kvBucket.history({ key: filter })

    for await (const entry of history) {
      if (entry.delta !== 0) {
        continue
      }
      if (entry.operation === 'DEL' || entry.operation === 'PURGE') {
        latestByKeys.delete(entry.key)
        continue
      }
      latestByKeys.set(entry.key, { key: entry.key, revision: entry.revision, created: entry.created })
    }

    return Array.from(latestByKeys)
      .map(([, item]) => item)
      .sort((a, b) => a.revision - b.revision)
  }

  async watchBucketKeys(params: {
    bucketName: string
    filter: string | string[]
    handler: (handlerParams: {
      key: string
      operation: 'update' | 'delete'
      revision: number
      delta?: number
    }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, filter, handler } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const streamInfo = await this.jsm.streams.info(`KV_${bucketName}`).catch(() => null)
    const snapshotRevision = streamInfo?.state.last_seq ?? 0

    const watcher = await kvBucket.watch({ key: filter })

    const processWatch = async () => {
      for await (const entry of watcher) {
        if (!entry) {
          continue
        }

        const isDelete = entry.operation === 'DEL' || entry.operation === 'PURGE'

        if (isDelete && entry.revision <= snapshotRevision) {
          // Skip delete tombstones that existed before we started watching.
          logger.debug('Skipping pre-existing delete tombstone', {
            bucketName,
            filter,
            key: entry.key,
            revision: entry.revision,
            snapshotRevision,
          })
          continue
        }

        if (!isDelete && (!entry.value || entry.value.length === 0)) {
          // Treat empty value as delete
          logger.warn('Received empty bucket entry - ignoring', { bucketName, filter, key: entry.key })
          continue
        }
        if (isDelete) {
          if (entry.delta === 0) {
            await handler({
              key: entry.key,
              operation: 'delete',
              revision: entry.revision,
            })
          }
          continue
        }

        await handler({
          key: entry.key,
          operation: 'update',
          revision: entry.revision,
          delta: entry.delta,
        })
      }
    }

    processWatch()
      .then(() => logger.debug('watchBucketKeys worker loop finished'))
      .catch((error) => logger.error('Error in watchBucketKeys loop', { bucketName, filter, error }))

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

  async watchBucket<T extends z.ZodTypeAny>(params: {
    bucketName: string
    filter: string | string[]
    schema: T
    handler: (handlerParams: {
      key: string
      operation: 'update' | 'delete'
      revision: number
      delta?: number
      entry: z.infer<T> | null
    }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { schema, bucketName, filter, handler } = params

    const kvBucket = await this.js.views.kv(bucketName)

    // Capture the stream's last sequence before subscribing. Any delete entry with
    // revision <= snapshotRevision was already tombstoned before we started watching
    // and should not be surfaced to the handler. Using a sequence number (from NATS)
    // instead of a wall-clock timestamp avoids clock-skew issues when client and
    // server run on different hosts.
    const streamInfo = await this.jsm.streams.info(`KV_${bucketName}`).catch(() => null)
    const snapshotRevision = streamInfo?.state.last_seq ?? 0

    const watcher = await kvBucket.watch({ key: filter })

    const processWatch = async () => {
      for await (const entry of watcher) {
        if (!entry) {
          continue
        }
        const isDelete = entry.operation === 'DEL' || entry.operation === 'PURGE'

        if (isDelete && entry.revision <= snapshotRevision) {
          // Skip delete tombstones that existed before we started watching.
          logger.debug('Skipping pre-existing delete tombstone', {
            bucketName,
            filter,
            key: entry.key,
            revision: entry.revision,
            snapshotRevision,
          })
          continue
        }

        if (!isDelete && (!entry.value || entry.value.length === 0)) {
          // Treat empty value as delete
          logger.warn('Received empty bucket entry - ignoring', { bucketName, filter, key: entry.key })
          continue
        }

        if (isDelete) {
          if (entry.delta === 0) {
            await handler({
              key: entry.key,
              operation: 'delete',
              revision: entry.revision,
              entry: null,
            })
          }
          continue
        }

        try {
          const raw = new TextDecoder().decode(entry.value)
          const json = JSON.parse(raw)
          const parsedEntry = schema.parse(json)
          await handler({
            key: entry.key,
            operation: 'update',
            revision: entry.revision,
            entry: parsedEntry,
          })
        } catch (error) {
          const valueSnippet = entry.value ? new TextDecoder().decode(entry.value.slice(0, 100)) : 'N/A'

          logger.error('Error in bucket watch handler', {
            error,
            bucketName,
            filter,
            entry,
            valueSnippet,
          })
        }
      }
    }

    // Start processing in background
    processWatch()
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

    const status = await kvBucket.status()

    if (status.values < 1) {
      return
    }

    await kvBucket.purge(key)
  }

  async deleteBucketEntries(params: { bucketName: string; filter: string | string[] }): Promise<void> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, filter } = params
    const filters = Array.isArray(filter) ? filter : [filter]
    const streamName = `KV_${bucketName}`

    const kvBucket = await this.js.views.kv(bucketName)

    // history() correctly terminates for empty buckets (unlike keys() which hangs)
    const keysToDelete = new Set<string>()
    for (const f of filters) {
      const history = await kvBucket.history({ key: f })
      for await (const entry of history) {
        if (entry.operation === 'DEL' || entry.operation === 'PURGE') {
          keysToDelete.delete(entry.key)
        } else {
          keysToDelete.add(entry.key)
        }
      }
    }

    if (keysToDelete.size === 0) {
      return
    }

    // KV-level purge notifies any active watchers with a delete event
    await Promise.all([...keysToDelete].map((key) => kvBucket.purge(key)))

    // Stream-level purge removes the tombstones so the bucket stays clean
    await Promise.all(filters.map((f) => this.jsm!.streams.purge(streamName, { filter: `$KV.${bucketName}.${f}` })))
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
