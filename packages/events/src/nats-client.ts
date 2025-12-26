/**
 * NATS JetStream client utilities for event-driven architecture
 *
 * Features:
 * - Workspace isolation via NATS subjects (workspace_{id}.{event-type})
 * - JetStream for durable event delivery
 * - Consumer groups for competing consumers (horizontal scaling)
 * - Type-safe event publishing and subscribing
 */
import {
  AckPolicy,
  type ConnectionOptions,
  type Consumer,
  type ConsumerMessages,
  DeliverPolicy,
  type JetStreamClient,
  type JetStreamManager,
  type JetStreamPublishOptions,
  type JsMsg,
  type NatsConnection,
  RetentionPolicy,
  StorageType,
  connect,
} from 'nats'

import type { GeorgeAIEvent } from './types'

/**
 * NATS client configuration
 */
export interface NatsClientConfig {
  servers: string | string[]
  user?: string
  pass?: string
  token?: string
}

/**
 * Stream configuration for workspace events
 */
export interface StreamConfig {
  name: string
  subjects: string[]
  description?: string
  retentionPolicy?: RetentionPolicy
  maxAge?: number // nanoseconds
  maxMsgs?: number
  maxBytes?: number
  storageType?: StorageType
}

/**
 * Consumer configuration for subscribing to events
 */
export interface ConsumerConfig {
  streamName: string
  consumerName: string
  filterSubject?: string
  deliverPolicy?: DeliverPolicy
  ackPolicy?: AckPolicy
  maxAckPending?: number
  maxDeliver?: number
  ackWait?: number // nanoseconds
}

/**
 * Event handler function type
 */
export type EventHandler<T extends GeorgeAIEvent = GeorgeAIEvent> = (event: T, msg: JsMsg) => Promise<void>

/**
 * NATS JetStream client for George AI events
 */
export class NatsClient {
  private nc: NatsConnection | null = null
  private js: JetStreamClient | null = null
  private jsm: JetStreamManager | null = null

  /**
   * Connect to NATS server
   */
  async connect(config: NatsClientConfig): Promise<void> {
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

  /**
   * Create or update a JetStream stream
   */
  async createStream(config: StreamConfig): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    try {
      await this.jsm.streams.add({
        name: config.name,
        subjects: config.subjects,
        description: config.description,
        retention: config.retentionPolicy || RetentionPolicy.Limits,
        max_age: config.maxAge || 7 * 24 * 60 * 60 * 1e9, // 7 days default
        max_msgs: config.maxMsgs || -1, // unlimited
        max_bytes: config.maxBytes || -1, // unlimited
        storage: config.storageType || StorageType.File,
      })
      console.log(`Stream created/updated: ${config.name}`)
    } catch (error) {
      // Stream might already exist with different config
      console.log(`Stream exists: ${config.name}`, error)
    }
  }

  /**
   * Create or update a durable consumer
   */
  async createConsumer(config: ConsumerConfig): Promise<void> {
    if (!this.jsm) {
      throw new Error('Not connected to NATS')
    }

    try {
      await this.jsm.consumers.add(config.streamName, {
        durable_name: config.consumerName,
        filter_subject: config.filterSubject,
        deliver_policy: config.deliverPolicy || DeliverPolicy.All,
        ack_policy: config.ackPolicy || AckPolicy.Explicit,
        max_ack_pending: config.maxAckPending || 1000,
        max_deliver: config.maxDeliver || -1, // unlimited retries
        ack_wait: config.ackWait || 30 * 1e9, // 30 seconds default
      })
      console.log(`Consumer created/updated: ${config.consumerName}`)
    } catch (error) {
      console.log(`Consumer exists: ${config.consumerName}`, error)
    }
  }

  /**
   * Publish an event to a workspace subject
   */
  async publish(workspaceId: string, event: GeorgeAIEvent, options?: JetStreamPublishOptions): Promise<void> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    // Subject format: workspace_{id}.{event-type}
    const subject = this.getSubject(workspaceId, event.type)

    // Encode event as JSON
    const payload = new TextEncoder().encode(JSON.stringify(event))

    // Publish to JetStream
    const ack = await this.js.publish(subject, payload, options)

    console.log(`Published event ${event.type} to ${subject} (seq: ${ack.seq})`)
  }

  /**
   * Subscribe to workspace events with a consumer group
   */
  async subscribe<T extends GeorgeAIEvent = GeorgeAIEvent>(
    workspaceId: string,
    eventType: string,
    consumerName: string,
    handler: EventHandler<T>,
  ): Promise<() => Promise<void>> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const streamName = this.getStreamName(workspaceId)
    const subject = this.getSubject(workspaceId, eventType)

    // Ensure stream and consumer exist
    await this.createStream({
      name: streamName,
      subjects: [`workspace_${workspaceId}.*`],
      description: `Events for workspace ${workspaceId}`,
    })

    await this.createConsumer({
      streamName,
      consumerName,
      filterSubject: subject,
    })

    // Get consumer
    const consumer: Consumer = await this.js.consumers.get(streamName, consumerName)

    // Consume messages
    const messages: ConsumerMessages = await consumer.consume()

    // Process messages
    const processMessages = async () => {
      for await (const msg of messages) {
        try {
          // Decode event
          const eventData = new TextDecoder().decode(msg.data)
          const event = JSON.parse(eventData) as T

          // Call handler
          await handler(event, msg)

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
      messages.close()
    }
  }

  /**
   * Subscribe to all event types for a workspace
   */
  async subscribeAll(workspaceId: string, consumerName: string, handler: EventHandler): Promise<() => Promise<void>> {
    if (!this.js) {
      throw new Error('Not connected to NATS')
    }

    const streamName = this.getStreamName(workspaceId)
    const subject = `workspace_${workspaceId}.*`

    // Ensure stream and consumer exist
    await this.createStream({
      name: streamName,
      subjects: [subject],
      description: `Events for workspace ${workspaceId}`,
    })

    await this.createConsumer({
      streamName,
      consumerName,
      filterSubject: subject,
    })

    // Get consumer
    const consumer: Consumer = await this.js.consumers.get(streamName, consumerName)

    // Consume messages
    const messages: ConsumerMessages = await consumer.consume()

    // Process messages
    const processMessages = async () => {
      for await (const msg of messages) {
        try {
          // Decode event
          const eventData = new TextDecoder().decode(msg.data)
          const event = JSON.parse(eventData) as GeorgeAIEvent

          // Call handler
          await handler(event, msg)

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
      messages.close()
    }
  }

  /**
   * Get the stream name for a workspace
   */
  private getStreamName(workspaceId: string): string {
    return `workspace_${workspaceId}`
  }

  /**
   * Get the subject for a workspace event
   */
  private getSubject(workspaceId: string, eventType: string): string {
    // Convert event type to kebab-case
    const kebabEventType = eventType.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    return `workspace_${workspaceId}.${kebabEventType}`
  }

  /**
   * Check if connected to NATS
   */
  isConnected(): boolean {
    return this.nc !== null && !this.nc.isClosed()
  }

  /**
   * Get the underlying NATS connection
   */
  getConnection(): NatsConnection | null {
    return this.nc
  }

  /**
   * Get the JetStream client
   */
  getJetStream(): JetStreamClient | null {
    return this.js
  }

  /**
   * Get the JetStream manager
   */
  getJetStreamManager(): JetStreamManager | null {
    return this.jsm
  }
}

/**
 * Create and connect a new NATS client
 */
export const createNatsClient = async (config: NatsClientConfig): Promise<NatsClient> => {
  const client = new NatsClient()
  await client.connect(config)
  return client
}
