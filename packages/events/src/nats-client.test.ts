/**
 * NATS client integration tests
 *
 * These tests require a running NATS server with JetStream enabled.
 * Run: docker-compose up gai-nats
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { type EventHandler, NatsClient, type NatsClientConfig, createNatsClient } from './nats-client'
import type { FileExtractedEvent, GeorgeAIEvent } from './types'
import { createFileEmbeddedEvent, createFileEmbeddingFailedEvent, createFileExtractedEvent } from './utils'

const NATS_CONFIG: NatsClientConfig = {
  servers: process.env.NATS_URL || 'nats://gai-nats:4222',
}

const TEST_WORKSPACE_ID = 'test-workspace-123'

describe('NatsClient', () => {
  let client: NatsClient

  beforeAll(async () => {
    client = await createNatsClient(NATS_CONFIG)
  })

  afterAll(async () => {
    await client.disconnect()
  })

  describe('Connection', () => {
    it('should connect to NATS server', () => {
      expect(client.isConnected()).toBe(true)
    })

    it('should get connection instance', () => {
      const connection = client.getConnection()
      expect(connection).not.toBeNull()
      expect(connection?.isClosed()).toBe(false)
    })

    it('should get JetStream client', () => {
      const js = client.getJetStream()
      expect(js).not.toBeNull()
    })

    it('should get JetStream manager', () => {
      const jsm = client.getJetStreamManager()
      expect(jsm).not.toBeNull()
    })
  })

  describe('Stream Management', () => {
    it('should create a stream', async () => {
      await client.createStream({
        name: `workspace_${TEST_WORKSPACE_ID}`,
        subjects: [`workspace_${TEST_WORKSPACE_ID}.*`],
        description: 'Test stream',
      })

      const jsm = client.getJetStreamManager()
      const stream = await jsm?.streams.info(`workspace_${TEST_WORKSPACE_ID}`)
      expect(stream?.config.name).toBe(`workspace_${TEST_WORKSPACE_ID}`)
    })

    it('should handle existing stream', async () => {
      // Should not throw when stream already exists
      await client.createStream({
        name: `workspace_${TEST_WORKSPACE_ID}`,
        subjects: [`workspace_${TEST_WORKSPACE_ID}.*`],
        description: 'Test stream',
      })
    })
  })

  describe('Consumer Management', () => {
    beforeEach(async () => {
      // Ensure stream exists
      await client.createStream({
        name: `workspace_${TEST_WORKSPACE_ID}`,
        subjects: [`workspace_${TEST_WORKSPACE_ID}.*`],
      })
    })

    it('should create a consumer', async () => {
      await client.createConsumer({
        streamName: `workspace_${TEST_WORKSPACE_ID}`,
        consumerName: 'test-consumer',
        filterSubject: `workspace_${TEST_WORKSPACE_ID}.file-extracted`,
      })

      const jsm = client.getJetStreamManager()
      const consumer = await jsm?.consumers.info(`workspace_${TEST_WORKSPACE_ID}`, 'test-consumer')
      expect(consumer?.name).toBe('test-consumer')
    })

    it('should handle existing consumer', async () => {
      // Should not throw when consumer already exists
      await client.createConsumer({
        streamName: `workspace_${TEST_WORKSPACE_ID}`,
        consumerName: 'test-consumer',
      })
    })
  })

  describe('Event Publishing', () => {
    it('should publish FileExtractedEvent', async () => {
      const event = createFileExtractedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-123',
        fileId: 'file-456',
        fileName: 'test.pdf',
        markdownPath: 'file-456/markdown.md',
        embeddingModelId: 'model-789',
        embeddingModelName: 'text-embedding-ada-002',
        embeddingModelProvider: 'openai',
        embeddingDimensions: 1536,
      })

      await client.publish(TEST_WORKSPACE_ID, event)

      // Event should be in stream
      const jsm = client.getJetStreamManager()
      const stream = await jsm?.streams.info(`workspace_${TEST_WORKSPACE_ID}`)
      expect(stream?.state.messages).toBeGreaterThan(0)
    })

    it('should publish FileEmbeddedEvent', async () => {
      const event = createFileEmbeddedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        fileId: 'file-456',
        processingTaskId: 'task-789',
        qdrantCollection: `workspace_${TEST_WORKSPACE_ID}`,
        qdrantNamedVector: 'model_model-789',
        chunksCount: 100,
        chunksSize: 50000,
      })

      await client.publish(TEST_WORKSPACE_ID, event)
    })

    it('should publish FileEmbeddingFailedEvent', async () => {
      const event = createFileEmbeddingFailedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        fileId: 'file-456',
        processingTaskId: 'task-789',
        errorMessage: 'Test error',
      })

      await client.publish(TEST_WORKSPACE_ID, event)
    })
  })

  describe('Event Subscription', () => {
    it('should subscribe to FileExtractedEvent', async () => {
      const receivedEvents: FileExtractedEvent[] = []

      const handler: EventHandler<FileExtractedEvent> = async (event) => {
        receivedEvents.push(event)
      }

      const cleanup = await client.subscribe(TEST_WORKSPACE_ID, 'FileExtracted', 'test-extracted-consumer', handler)

      // Publish test event
      const testEvent = createFileExtractedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-123',
        fileId: 'file-sub-test',
        fileName: 'subscription-test.pdf',
        markdownPath: 'file-sub-test/markdown.md',
        embeddingModelId: 'model-789',
        embeddingModelName: 'text-embedding-ada-002',
        embeddingModelProvider: 'openai',
        embeddingDimensions: 1536,
      })

      await client.publish(TEST_WORKSPACE_ID, testEvent)

      // Wait for event to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000))

      expect(receivedEvents.length).toBeGreaterThan(0)
      const lastEvent = receivedEvents[receivedEvents.length - 1]
      expect(lastEvent.type).toBe('FileExtracted')
      expect(lastEvent.fileId).toBe('file-sub-test')

      await cleanup()
    })

    it('should subscribe to all events', async () => {
      const receivedEvents: GeorgeAIEvent[] = []

      const handler: EventHandler = async (event) => {
        receivedEvents.push(event)
      }

      const cleanup = await client.subscribeAll(TEST_WORKSPACE_ID, 'test-all-consumer', handler)

      // Publish different event types
      const extractedEvent = createFileExtractedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-123',
        fileId: 'file-all-test-1',
        fileName: 'all-test-1.pdf',
        markdownPath: 'file-all-test-1/markdown.md',
        embeddingModelId: 'model-789',
        embeddingModelName: 'text-embedding-ada-002',
        embeddingModelProvider: 'openai',
        embeddingDimensions: 1536,
      })

      const embeddedEvent = createFileEmbeddedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        fileId: 'file-all-test-2',
        processingTaskId: 'task-123',
        qdrantCollection: `workspace_${TEST_WORKSPACE_ID}`,
        qdrantNamedVector: 'model_model-789',
        chunksCount: 50,
        chunksSize: 25000,
      })

      await client.publish(TEST_WORKSPACE_ID, extractedEvent)
      await client.publish(TEST_WORKSPACE_ID, embeddedEvent)

      // Wait for events to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000))

      expect(receivedEvents.length).toBeGreaterThan(0)
      const types = receivedEvents.map((e) => e.type)
      expect(types).toContain('FileExtracted')
      expect(types).toContain('FileEmbedded')

      await cleanup()
    })

    it('should handle multiple competing consumers', async () => {
      const consumer1Events: FileExtractedEvent[] = []
      const consumer2Events: FileExtractedEvent[] = []

      const handler1: EventHandler<FileExtractedEvent> = async (event) => {
        consumer1Events.push(event)
      }

      const handler2: EventHandler<FileExtractedEvent> = async (event) => {
        consumer2Events.push(event)
      }

      // Both consumers use the same consumer name (competing consumers)
      const cleanup1 = await client.subscribe(TEST_WORKSPACE_ID, 'FileExtracted', 'competing-consumer', handler1)

      const cleanup2 = await client.subscribe(TEST_WORKSPACE_ID, 'FileExtracted', 'competing-consumer', handler2)

      // Publish multiple events
      for (let i = 0; i < 10; i++) {
        const event = createFileExtractedEvent({
          workspaceId: TEST_WORKSPACE_ID,
          libraryId: 'lib-123',
          fileId: `file-compete-${i}`,
          fileName: `compete-${i}.pdf`,
          markdownPath: `file-compete-${i}/markdown.md`,
          embeddingModelId: 'model-789',
          embeddingModelName: 'text-embedding-ada-002',
          embeddingModelProvider: 'openai',
          embeddingDimensions: 1536,
        })

        await client.publish(TEST_WORKSPACE_ID, event)
      }

      // Wait for events to be processed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Events should be distributed between consumers
      const totalEvents = consumer1Events.length + consumer2Events.length
      expect(totalEvents).toBeGreaterThan(0)

      await cleanup1()
      await cleanup2()
    })
  })

  describe('Error Handling', () => {
    it('should handle publish errors gracefully', async () => {
      // Create a new client that's not connected
      const disconnectedClient = new NatsClient()

      await expect(
        disconnectedClient.publish(
          TEST_WORKSPACE_ID,
          createFileExtractedEvent({
            workspaceId: TEST_WORKSPACE_ID,
            libraryId: 'lib-123',
            fileId: 'file-error',
            fileName: 'error.pdf',
            markdownPath: 'file-error/markdown.md',
            embeddingModelId: 'model-789',
            embeddingModelName: 'test-model',
            embeddingModelProvider: 'test',
            embeddingDimensions: 1536,
          }),
        ),
      ).rejects.toThrow('Not connected to NATS')
    })

    it('should handle invalid event data in subscriber', async () => {
      let errorOccurred = false

      const handler: EventHandler = async (event) => {
        // This will fail if event is malformed
        if (!event.workspaceId) {
          errorOccurred = true
          throw new Error('Invalid event')
        }
      }

      const cleanup = await client.subscribe(TEST_WORKSPACE_ID, 'FileExtracted', 'error-handler-consumer', handler)

      // Publish valid event
      const validEvent = createFileExtractedEvent({
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-123',
        fileId: 'file-valid',
        fileName: 'valid.pdf',
        markdownPath: 'file-valid/markdown.md',
        embeddingModelId: 'model-789',
        embeddingModelName: 'test-model',
        embeddingModelProvider: 'test',
        embeddingDimensions: 1536,
      })

      await client.publish(TEST_WORKSPACE_ID, validEvent)

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Should not have errors with valid event
      expect(errorOccurred).toBe(false)

      await cleanup()
    })
  })
})
