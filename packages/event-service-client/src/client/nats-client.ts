import {
  AckPolicy,
  type ConnectionOptions,
  Consumer,
  DeliverPolicy,
  type JetStreamClient,
  type JetStreamManager,
  type NatsConnection,
  RetentionPolicy,
  StorageType,
  connect,
} from 'nats'

import { createLogger } from '@george-ai/web-utils'

import { EventClientConfig } from '.'
import { EventClient } from './event-client'

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

  async ensureStream(args: {
    streamName: string
    subjects: string[]
    description?: string
    persist: boolean
  }): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, subjects, description, persist } = args

    const existingStream = await this.jsm.streams.info(streamName).catch(() => null)
    if (!existingStream) {
      logger.info(`Stream didn't exists, creating: ${streamName} (persist: ${persist})`)
      await this.jsm.streams.add({
        name: streamName,
        subjects,
        description,
        retention: persist ? RetentionPolicy.Limits : RetentionPolicy.Workqueue,
        max_age: persist ? 0 : 30 * 24 * 60 * 60 * 1e9, // 30 days vs 1 day
        max_msgs: -1, // unlimited
        max_bytes: -1, // unlimited
        storage: persist ? StorageType.File : StorageType.Memory,
      })
    } else {
      const existingSubjects = existingStream.config.subjects.sort().join(',')
      const desiredSubjects = subjects.sort().join(',')
      const existingPersist = existingStream.config.retention === RetentionPolicy.Limits
      const desiredPersist = persist
      logger.info(`Stream already exists: ${streamName} (persist: ${existingPersist})`)
      if (existingPersist !== desiredPersist) {
        logger.error(
          `Stream persistence mismatch for ${streamName}, existing: ${existingPersist}, desired: ${desiredPersist}. Updating...`,
        )
        throw new Error('Cannot change stream persistence after creation')
      }
      if (existingSubjects !== desiredSubjects) {
        logger.info(
          `Stream subjects mismatch for ${streamName}, existing: ${existingSubjects}, desired: ${desiredSubjects}. Updating...`,
        )
        await this.jsm.streams.update(streamName, {
          subjects,
        })
      }
      if (description && existingStream.config.description !== description) {
        logger.info(
          `Stream description mismatch for ${streamName}, existing: ${existingStream.config.description}, desired: ${description}. Updating...`,
        )
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

  async publish(params: {
    subject: string
    payload: Uint8Array<ArrayBufferLike>
    timeoutMs?: number
  }): Promise<{ streamName: string; msgId: string }> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { subject, payload, timeoutMs } = params

    const msgID = crypto.randomUUID()
    // Publish to JetStream
    const ack = await this.js.publish(subject, payload, {
      msgID,
      timeout: timeoutMs ? timeoutMs : 5000,
    })

    return { streamName: ack.stream, msgId: msgID }
  }

  private getDurableName(subjectFilter: string | string[]): string {
    if (Array.isArray(subjectFilter)) {
      subjectFilter = subjectFilter
        .sort((a, b) => a.localeCompare(b, 'en-US'))
        .map((subject) => this.getDurableName(subject))
        .join('_')
    }
    return subjectFilter
      .replace(/\*/g, 'ALL') // Replace wildcards first
      .replace(/>/g, 'REMAINING') // Handle the "all following" wildcard
      .replace(/[^a-zA-Z0-9-]/g, '_') // Replace dots and special chars with _
      .replace(/_{2,}/g, '_') // Collapse multiple underscores (e.g., ___) into one
      .replace(/^_+|_+$/g, '') // Trim underscores from start/end
  }

  private async ensureStreamConsumer(streamName: string, subjectFilters: string[]): Promise<Consumer> {
    if (!this.jsm || !this.js) {
      throw new Error('Not connected to NATS')
    }
    const durable_name = this.getDurableName(subjectFilters)

    logger.info(`Ensuring consumer ${durable_name} with filters "${subjectFilters.join(', ')}" on stream ${streamName}`)

    let consumerInfo = await this.jsm.consumers.info(streamName, durable_name).catch(() => null)
    if (!consumerInfo) {
      consumerInfo = await this.jsm.consumers.add(streamName, {
        durable_name,
        filter_subjects: subjectFilters,
        deliver_policy: DeliverPolicy.All,
        ack_policy: AckPolicy.Explicit,
        // max_ack_pending: 1000,
      })
    }

    return this.js.consumers.get(streamName, consumerInfo.name)
  }

  async subscribe(params: {
    subjectFilters: string[]
    streamName: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { subjectFilters, streamName, handler } = params

    const stream = await this.getStream(streamName)

    if (!stream) {
      throw new Error(`Stream does not exist: ${streamName}`)
    }

    const consumer = await this.ensureStreamConsumer(streamName, subjectFilters)
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
          logger.error(`Error processing event:`, error)
          // Negative acknowledge to retry later
          msg.nak()
        }
      }
    }

    // Start processing in background
    processMessages().catch((error) => {
      logger.error('Error in message processing loop:', error)
    })

    // Return cleanup function
    return async () => {
      await messages.close()
    }
  }

  async getStreamStatistics(params: {
    streamName: string
    subjectFilter: string
  }): Promise<{ totalMessages: number; processedMessages: number; pendingMessages: number }> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { streamName, subjectFilter } = params

    const consumer = await this.ensureStreamConsumer(streamName, [subjectFilter])
    const consumerInfo = await consumer.info(true)
    const streamInfo = await this.jsm.streams.info(streamName)
    const stats = {
      totalMessages: streamInfo.state.messages,
      processedMessages: consumerInfo.ack_floor.stream_seq,
      pendingMessages: consumerInfo.num_pending,
    }
    return stats
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

    const response = await this.nc.request(subject, payload, {
      timeout: timeoutMs,
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
          logger.error(`Error in ${subject} handler:`, err)
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

    await this.js.views.kv(name, {
      history: options?.history || 1,
      ttl: options?.ttlMs ? options.ttlMs * 1e6 : 0,
      storage: StorageType.Memory,
    })
  }

  async put(params: { bucketName: string; key: string; value: Uint8Array<ArrayBufferLike> }): Promise<void> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key, value } = params

    const kvBucket = await this.js.views.kv(bucketName)

    await kvBucket.put(key, value)
  }

  async get(params: { bucketName: string; key: string }): Promise<Uint8Array<ArrayBufferLike> | null> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const entry = await kvBucket.get(key).catch(() => null)
    if (!entry) {
      return null
    }

    return entry.value
  }

  async watch(params: {
    bucketName: string
    key: string
    handler: (handlerParams: {
      key: string
      operation: 'create' | 'update' | 'delete'
      value: Uint8Array<ArrayBufferLike>
    }) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const { bucketName, key, handler } = params

    const kvBucket = await this.js.views.kv(bucketName)

    const watcher = await kvBucket.watch({ key })

    const processWatch = async () => {
      for await (const entry of watcher) {
        await handler({
          key: entry.key,
          operation: entry.operation === 'PUT' ? 'update' : 'delete',
          value: entry.value,
        })
      }
    }

    // Start processing in background
    processWatch().catch((error) => {
      logger.error('Error in watch processing loop:', error)
    })

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
}
