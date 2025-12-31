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
} from 'nats'

import { EventClientConfig } from '.'
import { EventClient } from './event-client'

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

    console.log(`Connected to NATS server: ${this.nc.getServer()}`)
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
      console.log('Disconnected from NATS server')
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
      console.log(`Stream didn't exists, creating: ${streamName} (persist: ${persist})`)
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
      console.log(`Stream already exists: ${streamName} (persist: ${existingPersist})`)
      if (existingPersist !== desiredPersist) {
        console.error(
          `Stream persistence mismatch for ${streamName}, existing: ${existingPersist}, desired: ${desiredPersist}. Updating...`,
        )
        throw new Error('Cannot change stream persistence after creation')
      }
      if (existingSubjects !== desiredSubjects) {
        console.log(
          `Stream subjects mismatch for ${streamName}, existing: ${existingSubjects}, desired: ${desiredSubjects}. Updating...`,
        )
        await this.jsm.streams.update(streamName, {
          subjects,
        })
      }
      if (description && existingStream.config.description !== description) {
        console.log(
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
      console.error(`Error deleting stream ${name}:`, err)
      throw err
    })
    console.log(`Deleted stream: ${name}`)
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

  async subscribe(params: {
    subscriptionName: string
    streamName: string
    subjectFilter: string
    handler: (payload: Uint8Array<ArrayBufferLike>) => Promise<void>
  }): Promise<() => Promise<void>> {
    if (!this.js || !this.jsm) {
      throw new Error('Not connected to NATS')
    }

    const { subscriptionName, streamName, subjectFilter, handler } = params

    const stream = await this.getStream(streamName)

    if (!stream) {
      throw new Error(`Stream does not exist: ${streamName}`)
    }

    console.log(`Creating subscription "${subscriptionName}" on stream ${streamName} with filter ${subjectFilter}`)

    const consumerInfo = await this.jsm.consumers.add(streamName, {
      durable_name: subscriptionName,
      filter_subject: subjectFilter,
      deliver_policy: DeliverPolicy.All,
      ack_policy: AckPolicy.Explicit,
      max_ack_pending: 1000,
    })

    const consumer = await this.js!.consumers.get(streamName, consumerInfo.name)
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
          console.error(`Error processing event:`, error)
          // Negative acknowledge to retry later
          msg.nak()
        }
      }
    }

    // Start processing in background
    processMessages().catch((error) => {
      console.error('Error in message processing loop:', error)
    })

    // Return cleanup function
    return async () => {
      await messages.close()
    }
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
          console.error(`Error in ${subject} handler:`, err)
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
}
