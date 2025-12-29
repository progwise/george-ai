import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { EventClient, EventClientAdmin } from '@george-ai/event-service-client'
import { createEventClient } from '@george-ai/event-service-client'

import { publishEmbeddingRequest, subscribeEmbeddingRequests } from './api'
import type { EmbeddingRequestEvent } from './event-types'

// Helper to generate unique workspace ID per test
// Note: NATS stream names cannot contain '.' so we convert Math.random() to integer
const getTestWorkspaceId = () => `test-workspace-api-${Date.now()}-${Math.floor(Math.random() * 1000000)}`

describe('Workspace Events API', () => {
  let client: EventClient & EventClientAdmin

  beforeAll(async () => {
    // Create event client for tests
    client = await createEventClient()
  })

  afterAll(async () => {
    // Clean up all test workspace streams
    if (client) {
      const allWorkspaceIds = await client.getWorkspaceStreams()
      const testWorkspaceIds = allWorkspaceIds.filter((id) => id.startsWith('test-workspace-api-'))

      for (const workspaceId of testWorkspaceIds) {
        try {
          await client.deleteWorkspaceStream(workspaceId)
        } catch (error) {
          // Ignore errors if stream doesn't exist
          console.warn(`Error deleting test workspace stream ${workspaceId}:`, error)
        }
      }
      await client.disconnect()
    }
  })

  describe('publishEmbeddingRequest', () => {
    it('should publish a valid embedding request event', async () => {
      const workspaceId = getTestWorkspaceId()

      const event: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 60000,
        processingTaskId: 'task-123',
        workspaceId,
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
      const workspaceId = getTestWorkspaceId()

      const event: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 120000,
        processingTaskId: 'task-multipart',
        workspaceId,
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
      const workspaceId = getTestWorkspaceId()
      const receivedEvents: EmbeddingRequestEvent[] = []

      const cleanup = await subscribeEmbeddingRequests(client, {
        consumerName: 'test-consumer-receive',
        workspaceId,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      const event: EmbeddingRequestEvent = {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 60000,
        processingTaskId: 'task-subscribe-test',
        workspaceId,
        libraryId: 'lib-sub-test',
        fileId: 'file-sub-test',
        markdownFilename: 'file-sub-test/markdown.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'test-model',
          embeddingModelProvider: 'openai',
        },
      }

      await publishEmbeddingRequest(client, event)

      // Wait for event to be received (max 5 seconds)
      let waitTime = 0
      while (receivedEvents.length < 1 && waitTime < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        waitTime += 100
      }

      expect(receivedEvents.length).toBe(1)
      expect(receivedEvents[0].processingTaskId).toBe('task-subscribe-test')
      expect(receivedEvents[0].fileId).toBe('file-sub-test')

      await cleanup()
    })

    it('should handle multiple events in sequence', async () => {
      const workspaceId = getTestWorkspaceId()
      const receivedEvents: EmbeddingRequestEvent[] = []

      // Subscribe first
      const cleanup = await subscribeEmbeddingRequests(client, {
        consumerName: 'test-consumer-multiple',
        workspaceId,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      // Now publish events one by one and verify each is received
      const events: EmbeddingRequestEvent[] = [
        {
          eventName: 'file-embedding-request',
          timestamp: new Date().toISOString(),
          timeoutMs: 60000,
          processingTaskId: 'task-multi-1',
          workspaceId,
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
          workspaceId,
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
          workspaceId,
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
      let waitTime = 0
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
      const workspaceId = getTestWorkspaceId()
      const consumer1Events: EmbeddingRequestEvent[] = []
      const consumer2Events: EmbeddingRequestEvent[] = []

      const cleanup1 = await subscribeEmbeddingRequests(client, {
        consumerName: 'competing-consumer',
        workspaceId,
        handler: async (event) => {
          consumer1Events.push(event)
        },
      })

      const cleanup2 = await subscribeEmbeddingRequests(client, {
        consumerName: 'competing-consumer',
        workspaceId,
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
          workspaceId,
          libraryId: 'lib-competing',
          fileId: `file-competing-${i}`,
          markdownFilename: `file-competing-${i}/markdown.md`,
          fileEmbeddingOptions: {
            embeddingModelName: 'competing-model',
            embeddingModelProvider: 'openai',
          },
        })
      }

      // Wait for all events to be received (max 5 seconds)
      let waitTime = 0
      while (consumer1Events.length + consumer2Events.length < eventCount && waitTime < 5000) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        waitTime += 100
      }

      const totalReceived = consumer1Events.length + consumer2Events.length
      expect(totalReceived).toBe(eventCount)

      console.log(`Consumer 1 received: ${consumer1Events.length} events`)
      console.log(`Consumer 2 received: ${consumer2Events.length} events`)

      await cleanup1()
      await cleanup2()
    })
  })
})
