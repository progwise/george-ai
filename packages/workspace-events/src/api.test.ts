import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { EventClient, EventClientAdmin } from '@george-ai/event-service-client'
import { createEventClient } from '@george-ai/event-service-client'

import { publishEmbeddingRequest, subscribeEmbeddingRequests } from './api'
import type { EmbeddingRequestEvent } from './event-types'

// Use unique workspace ID per test run to avoid interference
const TEST_WORKSPACE_ID = `test-workspace-api-${Date.now()}`

describe('Workspace Events API', () => {
  let client: EventClient & EventClientAdmin

  beforeAll(async () => {
    // Create event client for tests
    client = await createEventClient()
  })

  afterAll(async () => {
    // Clean up test streams before disconnecting
    if (client) {
      try {
        await client.deleteWorkspaceStream(TEST_WORKSPACE_ID)
      } catch (error) {
        console.log('Error deleting test stream (might not exist):', error)
      }

      await client.disconnect()
    }
  })

  describe('publishEmbeddingRequest', () => {
    it('should publish a valid embedding request event', async () => {
      const event: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 60000,
        processingTaskId: 'task-123',
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-456',
        fileId: 'file-789',
        markdownFilename: 'file-789/markdown.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'text-embedding-3-small',
          embeddingModelProvider: 'openai',
        },
      }

      await expect(publishEmbeddingRequest(client, event)).resolves.toBeUndefined()
    })

    it('should publish event with optional part field', async () => {
      const event: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 120000,
        processingTaskId: 'task-multipart',
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-456',
        fileId: 'file-multipart',
        part: 2,
        markdownFilename: 'file-multipart/markdown-part-2.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'text-embedding-ada-002',
          embeddingModelProvider: 'openai',
        },
      }

      await expect(publishEmbeddingRequest(client, event)).resolves.toBeUndefined()
    })
  })

  describe('subscribeEmbeddingRequests', () => {
    it('should subscribe and receive published events', async () => {
      const receivedEvents: EmbeddingRequestEvent[] = []

      const cleanup = await subscribeEmbeddingRequests(client, {
        consumerName: 'test-consumer-receive',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      const event: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 60000,
        processingTaskId: 'task-subscribe-test',
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-sub-test',
        fileId: 'file-sub-test',
        markdownFilename: 'file-sub-test/markdown.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'test-model',
          embeddingModelProvider: 'openai',
        },
      }

      await publishEmbeddingRequest(client, event)

      // Wait for event to be received
      await new Promise((resolve) => setTimeout(resolve, 2000))

      expect(receivedEvents.length).toBeGreaterThan(0)
      const receivedEvent = receivedEvents.find((e) => e.processingTaskId === 'task-subscribe-test')
      expect(receivedEvent).toBeDefined()
      expect(receivedEvent?.fileId).toBe('file-sub-test')

      await cleanup()
    })

    it('should handle multiple events in sequence', async () => {
      const receivedEvents: EmbeddingRequestEvent[] = []
      let consumerReady = false

      const cleanup = await subscribeEmbeddingRequests(client, {
        consumerName: 'test-consumer-multiple',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          consumerReady = true
          receivedEvents.push(event)
        },
      })

      // Publish a ready check event and wait for consumer to process it
      const readyEvent: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 60000,
        processingTaskId: 'task-ready-check',
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: 'lib-ready',
        fileId: 'file-ready',
        markdownFilename: 'ready.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'ready-model',
          embeddingModelProvider: 'test',
        },
      }

      await publishEmbeddingRequest(client, readyEvent)

      // Wait for consumer to be ready (max 5 seconds)
      let waitTime = 0
      while (!consumerReady && waitTime < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        waitTime += 100
      }

      expect(consumerReady).toBe(true)

      // Clear the ready event
      receivedEvents.length = 0

      // Now publish the actual test events
      const events: EmbeddingRequestEvent[] = [
        {
          eventName: 'file-embedding-request',
          timestamp: new Date().toISOString(),
          timeoutMs: 60000,
          processingTaskId: 'task-multi-1',
          workspaceId: TEST_WORKSPACE_ID,
          libraryId: 'lib-multi',
          fileId: 'file-multi-1',
          markdownFilename: 'file-multi-1/markdown.md',
          fileEmbeddingOptions: {
            embeddingModelName: 'model-1',
            embeddingModelProvider: 'openai',
          },
        },
        {
          eventName: 'file-embedding-request',
          timestamp: new Date().toISOString(),
          timeoutMs: 60000,
          processingTaskId: 'task-multi-2',
          workspaceId: TEST_WORKSPACE_ID,
          libraryId: 'lib-multi',
          fileId: 'file-multi-2',
          markdownFilename: 'file-multi-2/markdown.md',
          fileEmbeddingOptions: {
            embeddingModelName: 'model-2',
            embeddingModelProvider: 'ollama',
          },
        },
        {
          eventName: 'file-embedding-request',
          timestamp: new Date().toISOString(),
          timeoutMs: 60000,
          processingTaskId: 'task-multi-3',
          workspaceId: TEST_WORKSPACE_ID,
          libraryId: 'lib-multi',
          fileId: 'file-multi-3',
          markdownFilename: 'file-multi-3/markdown.md',
          fileEmbeddingOptions: {
            embeddingModelName: 'model-3',
            embeddingModelProvider: 'openai',
          },
        },
      ]

      for (const event of events) {
        await publishEmbeddingRequest(client, event)
      }

      // Wait for all 3 events to be received (max 5 seconds)
      waitTime = 0
      while (receivedEvents.length < 3 && waitTime < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        waitTime += 100
      }

      // All 3 events should be received
      expect(receivedEvents.length).toBe(3)
      expect(receivedEvents.some((e) => e.fileId === 'file-multi-1')).toBe(true)
      expect(receivedEvents.some((e) => e.fileId === 'file-multi-2')).toBe(true)
      expect(receivedEvents.some((e) => e.fileId === 'file-multi-3')).toBe(true)

      await cleanup()
    })

    it('should support competing consumers', async () => {
      const consumer1Events: EmbeddingRequestEvent[] = []
      const consumer2Events: EmbeddingRequestEvent[] = []

      const cleanup1 = await subscribeEmbeddingRequests(client, {
        consumerName: 'competing-consumer',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          consumer1Events.push(event)
        },
      })

      const cleanup2 = await subscribeEmbeddingRequests(client, {
        consumerName: 'competing-consumer',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          consumer2Events.push(event)
        },
      })

      const eventCount = 10
      for (let i = 0; i < eventCount; i++) {
        await publishEmbeddingRequest(client, {
          eventName: 'file-embedding-request',
          timestamp: new Date().toISOString(),
          timeoutMs: 60000,
          processingTaskId: `task-competing-${i}`,
          workspaceId: TEST_WORKSPACE_ID,
          libraryId: 'lib-competing',
          fileId: `file-competing-${i}`,
          markdownFilename: `file-competing-${i}/markdown.md`,
          fileEmbeddingOptions: {
            embeddingModelName: 'competing-model',
            embeddingModelProvider: 'openai',
          },
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))

      const totalReceived = consumer1Events.length + consumer2Events.length
      expect(totalReceived).toBeGreaterThan(0)

      console.log(`Consumer 1 received: ${consumer1Events.length} events`)
      console.log(`Consumer 2 received: ${consumer2Events.length} events`)

      await cleanup1()
      await cleanup2()
    })
  })
})
