import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { EventClient, EventClientAdmin } from './index'
import { createEventClient } from './index'

describe('Event Service Client - High-Level API', () => {
  let client: EventClient & EventClientAdmin

  beforeAll(async () => {
    // Create event client
    client = await createEventClient()
    expect(client.isConnected()).toBe(true)
  })

  afterAll(async () => {
    // Disconnect
    if (client) {
      await client.disconnect()
    }
  })

  describe('Factory Pattern', () => {
    it('should create independent client instances', async () => {
      const client1 = await createEventClient()
      const client2 = await createEventClient()

      // Different instances
      expect(client1).not.toBe(client2)
      expect(client1.isConnected()).toBe(true)
      expect(client2.isConnected()).toBe(true)

      // Cleanup
      await client1.disconnect()
      await client2.disconnect()
    })

    it('should create disconnected instances after disconnect', async () => {
      const tempClient = await createEventClient()
      expect(tempClient.isConnected()).toBe(true)

      await tempClient.disconnect()
      expect(tempClient.isConnected()).toBe(false)
    })
  })

  describe('Environment-Based Configuration', () => {
    it('should connect using environment variables', async () => {
      const tempClient = await createEventClient()

      expect(tempClient.isConnected()).toBe(true)

      await tempClient.disconnect()
    })

    it('should allow custom configuration', async () => {
      const tempClient = await createEventClient({
        servers: process.env.NATS_URL || 'nats://gai-nats:4222',
      })

      expect(tempClient.isConnected()).toBe(true)

      await tempClient.disconnect()
    })
  })

  describe('Publishing and Subscribing', () => {
    const testWorkspaceId = 'test-workspace-pubsub'

    it('should publish and subscribe to events', async () => {
      const receivedMessages: unknown[] = []

      // Subscribe
      const cleanup = await client.subscribe({
        workspaceId: testWorkspaceId,
        eventType: 'test-event',
        consumerName: 'test-consumer',
        handler: async (payload) => {
          receivedMessages.push(payload)
        },
      })

      // Give subscriber time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish event
      await client.publishEvent({
        workspaceId: testWorkspaceId,
        eventType: 'test-event',
        payload: { message: 'Hello from test!' },
      })

      // Wait for message to be processed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify
      expect(receivedMessages).toHaveLength(1)
      expect(receivedMessages[0]).toMatchObject({ message: 'Hello from test!' })

      // Cleanup
      await cleanup()
      await client.deleteWorkspaceStream(testWorkspaceId)
    })
  })

  describe('Request/Reply Pattern', () => {
    it('should handle request/reply operations', async () => {
      // Setup responder
      const cleanup = await client.respond<{ x: number; y: number }, { sum: number }>({
        subject: 'test.add',
        handler: async (request) => {
          return { sum: request.x + request.y }
        },
      })

      // Give responder time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Make request
      const response = await client.request<{ x: number; y: number }, { sum: number }>({
        subject: 'test.add',
        payload: { x: 5, y: 3 },
      })

      expect(response.sum).toBe(8)

      // Cleanup
      await cleanup()
    })
  })

  describe('Admin Operations', () => {
    it('should delete workspace stream', async () => {
      const testWorkspaceId = 'test-workspace-delete'

      // Create stream by publishing
      await client.publishEvent({
        workspaceId: testWorkspaceId,
        eventType: 'test',
        payload: { message: 'test' },
      })

      // Delete stream
      await client.deleteWorkspaceStream(testWorkspaceId)

      // Should not throw
      expect(true).toBe(true)
    })

    it('should delete consumer', async () => {
      const testWorkspaceId = 'test-workspace-consumer-delete'

      // Create consumer
      const cleanup = await client.subscribe({
        workspaceId: testWorkspaceId,
        eventType: 'test',
        consumerName: 'test-consumer',
        handler: async () => {},
      })

      await cleanup()

      // Delete consumer
      await client.deleteConsumer(testWorkspaceId, 'test-consumer')

      // Cleanup stream
      await client.deleteWorkspaceStream(testWorkspaceId)
    })
  })

  describe('Graceful Disconnect', () => {
    it('should handle disconnect gracefully', async () => {
      const tempClient = await createEventClient()

      expect(tempClient.isConnected()).toBe(true)

      await tempClient.disconnect()

      expect(tempClient.isConnected()).toBe(false)
    })

    it('should handle multiple disconnect calls', async () => {
      const tempClient = await createEventClient()

      await tempClient.disconnect()
      await tempClient.disconnect() // Should not throw

      expect(tempClient.isConnected()).toBe(false)
    })
  })
})
