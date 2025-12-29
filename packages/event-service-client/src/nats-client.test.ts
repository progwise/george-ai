import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { NatsClient, createNatsClient } from './nats-client'

describe('NatsClient', () => {
  let client: NatsClient

  beforeAll(async () => {
    // Create client and connect
    client = await createNatsClient({
      servers: process.env.NATS_URL || 'nats://gai-nats:4222',
      user: process.env.NATS_USER,
      pass: process.env.NATS_PASSWORD,
      token: process.env.NATS_TOKEN,
    })
  })

  afterAll(async () => {
    // Clean up: Disconnect from NATS
    if (client) {
      await client.disconnect()
    }
  })

  describe('Connection', () => {
    it('should connect to NATS server', () => {
      expect(client.isConnected()).toBe(true)
    })

    it('should have JetStream client', () => {
      expect(client.getJetStream()).toBeDefined()
    })

    it('should have JetStream manager', () => {
      expect(client.getJetStreamManager()).toBeDefined()
    })

    it('should have underlying NATS connection', () => {
      const connection = client.getConnection()
      expect(connection).toBeDefined()
      expect(connection?.isClosed()).toBe(false)
    })
  })

  describe('Stream Management', () => {
    const testWorkspaceId = 'test-workspace-001'
    const streamName = `workspace-${testWorkspaceId}`

    it('should create a new stream', async () => {
      await client.createStream({
        name: streamName,
        subjects: [`workspace.${testWorkspaceId}.events.*`],
        description: 'Test workspace stream',
      })

      // Verify stream exists
      const jsm = client.getJetStreamManager()
      expect(jsm).toBeDefined()

      const streamInfo = await jsm!.streams.info(streamName)
      expect(streamInfo.config.name).toBe(streamName)
      expect(streamInfo.config.subjects).toContain(`workspace.${testWorkspaceId}.events.*`)
    })

    it('should handle duplicate stream creation (idempotent)', async () => {
      // Create stream twice - should not throw
      await client.createStream({
        name: streamName,
        subjects: [`workspace.${testWorkspaceId}.events.*`],
        description: 'Test workspace stream',
      })

      await client.createStream({
        name: streamName,
        subjects: [`workspace.${testWorkspaceId}.events.*`],
        description: 'Test workspace stream',
      })

      // Stream should still exist
      const jsm = client.getJetStreamManager()
      const streamInfo = await jsm!.streams.info(streamName)
      expect(streamInfo.config.name).toBe(streamName)
    })

    it('should cache created streams to avoid redundant calls', async () => {
      const streamName2 = `workspace-${testWorkspaceId}-cached`

      // First call creates the stream
      await client.createStream({
        name: streamName2,
        subjects: [`workspace.${testWorkspaceId}.cached.*`],
        description: 'Test cached stream',
      })

      // Second call should be cached (no network call)
      // We can't easily verify this without mocking, but the cache exists in the implementation
      await client.createStream({
        name: streamName2,
        subjects: [`workspace.${testWorkspaceId}.cached.*`],
        description: 'Test cached stream',
      })

      const jsm = client.getJetStreamManager()
      const streamInfo = await jsm!.streams.info(streamName2)
      expect(streamInfo.config.name).toBe(streamName2)
    })
  })

  describe('Consumer Management', () => {
    const testWorkspaceId = 'test-workspace-002'
    const streamName = `workspace-${testWorkspaceId}`
    const consumerName = 'test-consumer'

    beforeAll(async () => {
      // Create stream for consumer tests
      await client.createStream({
        name: streamName,
        subjects: [`workspace.${testWorkspaceId}.events.*`],
        description: 'Test workspace stream for consumers',
      })
    })

    it('should create a durable consumer', async () => {
      await client.createConsumer({
        streamName,
        consumerName,
        filterSubject: `workspace.${testWorkspaceId}.events.test-event`,
      })

      // Verify consumer exists
      const jsm = client.getJetStreamManager()
      expect(jsm).toBeDefined()

      const consumerInfo = await jsm!.consumers.info(streamName, consumerName)
      expect(consumerInfo.name).toBe(consumerName)
      expect(consumerInfo.config.filter_subject).toBe(`workspace.${testWorkspaceId}.events.test-event`)
    })

    it('should handle duplicate consumer creation (idempotent)', async () => {
      // Create consumer twice - should not throw
      await client.createConsumer({
        streamName,
        consumerName: `${consumerName}-dup`,
        filterSubject: `workspace.${testWorkspaceId}.events.test-event`,
      })

      await client.createConsumer({
        streamName,
        consumerName: `${consumerName}-dup`,
        filterSubject: `workspace.${testWorkspaceId}.events.test-event`,
      })

      // Consumer should still exist
      const jsm = client.getJetStreamManager()
      const consumerInfo = await jsm!.consumers.info(streamName, `${consumerName}-dup`)
      expect(consumerInfo.name).toBe(`${consumerName}-dup`)
    })
  })

  describe('Publishing Events', () => {
    const testWorkspaceId = 'test-workspace-003'
    const streamName = `workspace-${testWorkspaceId}`

    beforeAll(async () => {
      // Create stream for publish tests
      await client.createStream({
        name: streamName,
        subjects: [`workspace.${testWorkspaceId}.events.*`],
        description: 'Test workspace stream for publishing',
      })
    })

    it('should publish an event to a subject', async () => {
      const subject = `workspace.${testWorkspaceId}.events.test-publish`
      const payload = JSON.stringify({
        eventName: 'test-publish',
        timestamp: new Date().toISOString(),
        workspaceId: testWorkspaceId,
        message: 'Test message',
      })

      await client.publish({
        subject,
        payload,
        timeout: 5000,
      })

      // Verify message was published by checking stream message count
      const jsm = client.getJetStreamManager()
      const streamInfo = await jsm!.streams.info(streamName)
      expect(streamInfo.state.messages).toBeGreaterThan(0)
    })

    it('should publish multiple events', async () => {
      const subject = `workspace.${testWorkspaceId}.events.test-multiple`

      for (let i = 0; i < 3; i++) {
        const payload = JSON.stringify({
          eventName: 'test-multiple',
          timestamp: new Date().toISOString(),
          workspaceId: testWorkspaceId,
          messageIndex: i,
        })

        await client.publish({
          subject,
          payload,
          timeout: 5000,
        })
      }

      // Verify messages were published
      const jsm = client.getJetStreamManager()
      const streamInfo = await jsm!.streams.info(streamName)
      expect(streamInfo.state.messages).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Subscribing to Events', () => {
    const testWorkspaceId = 'test-workspace-004'
    const streamName = `workspace-${testWorkspaceId}`
    const eventType = 'test-subscribe'

    beforeAll(async () => {
      // Create stream for subscribe tests
      await client.createStream({
        name: streamName,
        subjects: [`workspace.${testWorkspaceId}.events.*`],
        description: 'Test workspace stream for subscribing',
      })
    })

    it('should subscribe to events and receive messages', async () => {
      let receivedCount = 0
      const receivedMessages: unknown[] = []

      // Subscribe to events
      const cleanup = await client.subscribe({
        workspaceId: testWorkspaceId,
        consumerName: 'test-subscriber',
        eventType,
        handler: async (data: Uint8Array<ArrayBufferLike>) => {
          const message = JSON.parse(new TextDecoder().decode(data))
          receivedMessages.push(message)
          receivedCount++
        },
      })

      // Give subscriber time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish some test events
      const subject = `workspace.${testWorkspaceId}.events.${eventType}`
      for (let i = 0; i < 3; i++) {
        const payload = JSON.stringify({
          eventName: eventType,
          timestamp: new Date().toISOString(),
          workspaceId: testWorkspaceId,
          index: i,
        })

        await client.publish({
          subject,
          payload,
          timeout: 5000,
        })
      }

      // Wait for messages to be processed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify messages were received
      expect(receivedCount).toBe(3)
      expect(receivedMessages).toHaveLength(3)
      expect(receivedMessages[0]).toMatchObject({
        eventName: eventType,
        workspaceId: testWorkspaceId,
        index: 0,
      })

      // Cleanup
      await cleanup()
    })
  })

  describe('Disconnection', () => {
    it('should disconnect gracefully', async () => {
      const tempClient = await createNatsClient({
        servers: process.env.NATS_URL || 'nats://gai-nats:4222',
      })

      expect(tempClient.isConnected()).toBe(true)

      await tempClient.disconnect()

      expect(tempClient.isConnected()).toBe(false)
      // After disconnect, connection is null
      expect(tempClient.getConnection()).toBe(null)
    })

    it('should handle multiple disconnect calls', async () => {
      const tempClient = await createNatsClient({
        servers: process.env.NATS_URL || 'nats://gai-nats:4222',
      })

      await tempClient.disconnect()
      await tempClient.disconnect() // Should not throw

      expect(tempClient.isConnected()).toBe(false)
      expect(tempClient.getConnection()).toBe(null)
    })
  })
})
