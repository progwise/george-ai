import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { deleteWorkspaceStream, disconnect, publishEmbeddingRequest, subscribeEmbeddingRequests } from './api'
import type { EmbeddingRequestEvent } from './event-types'

const TEST_WORKSPACE_ID = 'test-workspace-api'

describe('Workspace Events API', () => {
  beforeAll(async () => {
    // Connection happens automatically on first publish/subscribe
  })

  afterAll(async () => {
    // Clean up test streams before disconnecting
    try {
      await deleteWorkspaceStream(TEST_WORKSPACE_ID)
    } catch (error) {
      console.log('Error deleting test stream (might not exist):', error)
    }

    await disconnect()
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

      await expect(publishEmbeddingRequest(event)).resolves.toBeUndefined()
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

      await expect(publishEmbeddingRequest(event)).resolves.toBeUndefined()
    })
  })

  describe('subscribeEmbeddingRequests', () => {
    it('should subscribe and receive published events', async () => {
      const receivedEvents: EmbeddingRequestEvent[] = []

      const cleanup = await subscribeEmbeddingRequests({
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

      await publishEmbeddingRequest(event)

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

      const cleanup = await subscribeEmbeddingRequests({
        consumerName: 'test-consumer-multiple',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

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
        await publishEmbeddingRequest(event)
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))

      expect(receivedEvents.length).toBeGreaterThanOrEqual(3)
      expect(receivedEvents.some((e) => e.fileId === 'file-multi-1')).toBe(true)
      expect(receivedEvents.some((e) => e.fileId === 'file-multi-2')).toBe(true)
      expect(receivedEvents.some((e) => e.fileId === 'file-multi-3')).toBe(true)

      await cleanup()
    })

    it('should support competing consumers', async () => {
      const consumer1Events: EmbeddingRequestEvent[] = []
      const consumer2Events: EmbeddingRequestEvent[] = []

      const cleanup1 = await subscribeEmbeddingRequests({
        consumerName: 'competing-consumer',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          consumer1Events.push(event)
        },
      })

      const cleanup2 = await subscribeEmbeddingRequests({
        consumerName: 'competing-consumer',
        workspaceId: TEST_WORKSPACE_ID,
        handler: async (event) => {
          consumer2Events.push(event)
        },
      })

      const eventCount = 10
      for (let i = 0; i < eventCount; i++) {
        await publishEmbeddingRequest({
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

  describe('Connection Management', () => {
    it('should handle disconnect gracefully', async () => {
      await expect(disconnect()).resolves.toBeUndefined()
    })
  })
})
