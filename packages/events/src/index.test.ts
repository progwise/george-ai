import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { type EventClient, createEventClient } from '@george-ai/event-service-client'

import { admin, workspace } from './index'

describe('Events Package', () => {
  let client: EventClient
  const testId = Date.now().toString()
  const testWorkspaceId = `test-workspace-${testId}`
  const streams: string[] = []

  beforeAll(async () => {
    client = await createEventClient()
  })

  afterAll(async () => {
    // Cleanup all test streams
    for (const streamName of streams) {
      await client.deleteStream(streamName).catch(() => {
        // Ignore errors if stream already deleted
      })
    }

    if (client) {
      await client.disconnect()
    }
  })

  describe('Workspace Events', () => {
    it('should publish and subscribe to embedding requests', async () => {
      const receivedEvents: string[] = []
      streams.push(`workspace-${testWorkspaceId}`)

      // Subscribe to embedding requests
      const cleanup = await workspace.subscribeEmbeddingRequests(client, {
        subscriptionName: `embedding-subscriber-${testId}`,
        workspaceId: testWorkspaceId,
        handler: async (event) => {
          receivedEvents.push(event.processingTaskId)
        },
      })

      // Give subscriber time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish embedding requests
      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 5000,
        processingTaskId: 'task-1',
        workspaceId: testWorkspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        markdownFilename: 'test.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })

      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 5000,
        processingTaskId: 'task-2',
        workspaceId: testWorkspaceId,
        libraryId: 'lib-1',
        fileId: 'file-2',
        markdownFilename: 'test2.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })

      // Wait for messages to be processed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify
      expect(receivedEvents).toHaveLength(2)
      expect(receivedEvents).toContain('task-1')
      expect(receivedEvents).toContain('task-2')

      // Cleanup
      await cleanup()
    })

    it('should publish and subscribe to provider config events', async () => {
      const receivedEvents: string[] = []
      const workspaceId = `test-workspace-provider-${testId}`
      streams.push(`workspace-${workspaceId}`)

      // Subscribe to provider config events
      const cleanup = await workspace.subscribeProviderConfigEvents(client, {
        subscriptionName: `provider-config-subscriber-${testId}`,
        workspaceId,
        handler: async (event) => {
          receivedEvents.push(event.workspaceId)
        },
      })

      // Give subscriber time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish provider config event
      await workspace.publishProviderConfigEvent(client, {
        eventName: 'workspace-provider-config',
        workspaceId,
        providers: [
          {
            providerId: 'provider-1',
            providerType: 'ollama',
            baseUrl: 'http://localhost:11434',
            enabled: true,
            models: [
              {
                id: 'model-1',
                name: 'llama3.2',
                capabilities: ['chat', 'embedding'],
              },
            ],
          },
        ],
        timestamp: new Date().toISOString(),
      })

      // Wait for messages to be processed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify
      expect(receivedEvents).toHaveLength(1)
      expect(receivedEvents[0]).toBe(workspaceId)

      // Cleanup
      await cleanup()
    })

    it('should handle consumer groups for embedding requests', async () => {
      const worker1Events: string[] = []
      const worker2Events: string[] = []
      const workspaceId = `test-workspace-consumer-group-${testId}`
      streams.push(`workspace-${workspaceId}`)

      const sharedGroupName = `embedding-workers-${testId}`

      // Two workers with SAME subscription name = consumer group (load balanced)
      const cleanup1 = await workspace.subscribeEmbeddingRequests(client, {
        subscriptionName: sharedGroupName,
        workspaceId,
        handler: async (event) => {
          worker1Events.push(event.processingTaskId)
        },
      })

      const cleanup2 = await workspace.subscribeEmbeddingRequests(client, {
        subscriptionName: sharedGroupName,
        workspaceId,
        handler: async (event) => {
          worker2Events.push(event.processingTaskId)
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish 10 events
      for (let i = 0; i < 10; i++) {
        await workspace.publishEmbeddingRequest(client, {
          eventName: 'file-embedding-request',
          timestamp: new Date().toISOString(),
          timeoutMs: 5000,
          processingTaskId: `task-${i}`,
          workspaceId,
          libraryId: 'lib-1',
          fileId: `file-${i}`,
          markdownFilename: `test${i}.md`,
          fileEmbeddingOptions: {
            embeddingModelName: 'nomic-embed-text',
            embeddingModelProvider: 'ollama',
          },
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Messages distributed between workers (consumer group = load balanced)
      const totalReceived = worker1Events.length + worker2Events.length
      expect(totalReceived).toBe(10)
      expect(worker1Events.length).toBeGreaterThan(0)
      expect(worker2Events.length).toBeGreaterThan(0)

      await cleanup1()
      await cleanup2()
    })
  })

  describe('Admin Events', () => {
    it('should publish and subscribe to workspace lifecycle events', async () => {
      const receivedEvents: Array<{ eventName: string; workspaceId: string }> = []
      streams.push('admin')

      // Subscribe to admin events
      const cleanup = await admin.subscribeWorkspaceLifecycle(client, {
        subscriptionName: `admin-subscriber-${testId}`,
        handler: async (event) => {
          receivedEvents.push({
            eventName: event.eventName,
            workspaceId: event.workspaceId,
          })
        },
      })

      // Give subscriber time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish workspace created event
      await admin.publishWorkspaceCreated(client, {
        eventName: 'workspace-created',
        workspaceId: 'ws-1',
        workspaceName: 'Test Workspace',
        timestamp: new Date().toISOString(),
      })

      // Publish workspace deleted event
      await admin.publishWorkspaceDeleted(client, {
        eventName: 'workspace-deleted',
        workspaceId: 'ws-2',
        timestamp: new Date().toISOString(),
      })

      // Wait for messages to be processed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify
      expect(receivedEvents).toHaveLength(2)
      expect(receivedEvents[0]).toEqual({
        eventName: 'workspace-created',
        workspaceId: 'ws-1',
      })
      expect(receivedEvents[1]).toEqual({
        eventName: 'workspace-deleted',
        workspaceId: 'ws-2',
      })

      // Cleanup
      await cleanup()
    })

    it('should delete workspace stream', async () => {
      const workspaceId = `test-workspace-delete-${testId}`

      // Create a workspace stream by publishing an event
      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 5000,
        processingTaskId: 'task-1',
        workspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        markdownFilename: 'test.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })

      // Delete the workspace stream
      await admin.deleteWorkspaceStream(client, workspaceId)

      // Verify stream is gone by trying to subscribe (should fail)
      await expect(
        workspace.subscribeEmbeddingRequests(client, {
          subscriptionName: `deleted-workspace-subscriber-${testId}`,
          workspaceId,
          handler: async () => {},
        }),
      ).rejects.toThrow('Stream does not exist')
    })

    it('should handle multiple independent admin subscribers', async () => {
      const subscriber1Events: string[] = []
      const subscriber2Events: string[] = []
      const testWorkspacePrefix = `ws-independent-${testId}`

      // Two subscribers with DIFFERENT names = independent (both receive all messages)
      const cleanup1 = await admin.subscribeWorkspaceLifecycle(client, {
        subscriptionName: `admin-subscriber-1-${testId}`,
        handler: async (event) => {
          // Only count events for this test
          if (event.eventName === 'workspace-created' && event.workspaceId.startsWith(testWorkspacePrefix)) {
            subscriber1Events.push(event.eventName)
          }
        },
      })

      const cleanup2 = await admin.subscribeWorkspaceLifecycle(client, {
        subscriptionName: `admin-subscriber-2-${testId}`,
        handler: async (event) => {
          // Only count events for this test
          if (event.eventName === 'workspace-created' && event.workspaceId.startsWith(testWorkspacePrefix)) {
            subscriber2Events.push(event.eventName)
          }
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish 5 events
      for (let i = 0; i < 5; i++) {
        await admin.publishWorkspaceCreated(client, {
          eventName: 'workspace-created',
          workspaceId: `${testWorkspacePrefix}-${i}`,
          workspaceName: `Workspace ${i}`,
          timestamp: new Date().toISOString(),
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Both subscribers receive ALL messages for this test (independent subscribers)
      expect(subscriber1Events.length).toBe(5)
      expect(subscriber2Events.length).toBe(5)

      await cleanup1()
      await cleanup2()
    })
  })

  describe('Stream Initialization', () => {
    it('should be idempotent - multiple calls should not error', async () => {
      const workspaceId = `test-workspace-idempotent-${testId}`
      streams.push(`workspace-${workspaceId}`)

      // Publish multiple times to same workspace
      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 5000,
        processingTaskId: 'task-1',
        workspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        markdownFilename: 'test.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })

      await workspace.publishProviderConfigEvent(client, {
        eventName: 'workspace-provider-config',
        workspaceId,
        providers: [],
        timestamp: new Date().toISOString(),
      })

      // Should not throw - stream already exists
      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        timeoutMs: 5000,
        processingTaskId: 'task-2',
        workspaceId,
        libraryId: 'lib-1',
        fileId: 'file-2',
        markdownFilename: 'test2.md',
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })
    })

    it('should ensure admin stream only once', async () => {
      // Publish multiple admin events
      await admin.publishWorkspaceCreated(client, {
        eventName: 'workspace-created',
        workspaceId: 'ws-test-1',
        workspaceName: 'Test 1',
        timestamp: new Date().toISOString(),
      })

      await admin.publishWorkspaceDeleted(client, {
        eventName: 'workspace-deleted',
        workspaceId: 'ws-test-2',
        timestamp: new Date().toISOString(),
      })

      // Should not error - admin stream should be created only once
    })
  })
})
