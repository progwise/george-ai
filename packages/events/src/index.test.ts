import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { type EventClient, createEventClient } from '@george-ai/event-service-client'

import { admin, workspace } from './index'

describe('Events Package - Integration Tests', () => {
  let client: EventClient
  const testId = Date.now().toString()
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

  describe('Admin Events - Workspace Lifecycle', () => {
    // Note: Admin stream is shared infrastructure - we don't delete it in cleanup
    // NATS will handle message retention based on stream retention policy

    const testAdminWorkspaceId = `test-admin-workspace-${testId}`
    const testAdminWorkspaceName = `Test Admin Workspace ${testId}`

    it('should publish and subscribe to workspace-created events', async () => {
      const receivedEvents: admin.workspaceLifecycle.WorkspaceCreatedEvent[] = []

      // Subscribe to workspace lifecycle events
      const cleanup = await admin.subscribeWorkspaceLifecycle(client, {
        subscriptionName: `admin-created-subscriber-${testId}`,
        handler: async (event) => {
          if (event.eventName === 'workspace-created') {
            receivedEvents.push(event)
          }
        },
      })

      // Give subscriber time to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish workspace created event
      await admin.publishWorkspaceCreated(client, {
        eventName: 'workspace-created',
        workspaceId: testAdminWorkspaceId,
        workspaceName: testAdminWorkspaceName,
        timestamp: new Date().toISOString(),
      })

      // Wait for message to be processed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify
      const filteredEvents = receivedEvents.filter((e) => e.workspaceId === testAdminWorkspaceId)
      expect(filteredEvents).toHaveLength(1)
      expect(filteredEvents[0].eventName).toBe('workspace-created')
      expect(filteredEvents[0].workspaceId).toBe(testAdminWorkspaceId)
      expect(filteredEvents[0].workspaceName).toBe(testAdminWorkspaceName)

      // Cleanup
      await cleanup()
    })

    it('should publish and subscribe to workspace-started events with providers and models', async () => {
      const receivedEvents: admin.workspaceLifecycle.WorkspaceStartupEvent[] = []

      // Subscribe to workspace lifecycle events
      const cleanup = await admin.subscribeWorkspaceLifecycle(client, {
        subscriptionName: `admin-started-subscriber-${testId}`,
        handler: async (event) => {
          // Only capture events for our test workspace
          if (event.eventName === 'workspace-started') {
            receivedEvents.push(event)
          }
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish workspace started event with configuration
      await admin.publishWorkspaceStartup(client, {
        workspaceId: testAdminWorkspaceId,
        providers: [
          {
            id: 'provider-1',
            name: 'ollama',
            baseUrl: 'http://localhost:11434',
            apiKey: undefined,
          },
        ],
        languageModels: [
          {
            id: 'model-1',
            name: 'llama3.2',
            provider: 'provider-1',
            canDoEmbedding: true,
            canDoChatCompletion: true,
            canDoVision: false,
            canDoFunctionCalling: false,
          },
        ],
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      const filteredEvents = receivedEvents.filter((e) => e.workspaceId === testAdminWorkspaceId)

      // Verify
      expect(filteredEvents).toHaveLength(1)
      expect(filteredEvents[0].eventName).toBe('workspace-started')
      expect(filteredEvents[0].workspaceId).toBe(testAdminWorkspaceId)
      expect(filteredEvents[0].providers).toHaveLength(1)
      expect(filteredEvents[0].providers[0].name).toBe('ollama')
      expect(filteredEvents[0].languageModels).toHaveLength(1)
      expect(filteredEvents[0].languageModels[0].name).toBe('llama3.2')

      await cleanup()
    })

    it('should publish and subscribe to workspace-deleted events', async () => {
      const receivedEvents: admin.workspaceLifecycle.WorkspaceDeletedEvent[] = []

      const cleanup = await admin.subscribeWorkspaceLifecycle(client, {
        subscriptionName: `admin-deleted-subscriber-${testId}`,
        handler: async (event) => {
          if (event.eventName === 'workspace-deleted') {
            receivedEvents.push(event)
          }
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      await admin.publishWorkspaceDeleted(client, {
        eventName: 'workspace-deleted',
        workspaceId: testAdminWorkspaceId,
        timestamp: new Date().toISOString(),
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      const filteredEvents = receivedEvents.filter((e) => e.workspaceId === testAdminWorkspaceId)
      expect(filteredEvents).toHaveLength(1)
      expect(filteredEvents[0].eventName).toBe('workspace-deleted')
      expect(filteredEvents[0].workspaceId).toBe(testAdminWorkspaceId)

      await cleanup()
    })
  })

  describe('Workspace Events - Embedding', () => {
    const testEmbeddingWorkspaceId = `test-embedding-workspace-${testId}`
    streams.push(`workspace-${testEmbeddingWorkspaceId}`)

    it('should publish and subscribe to embedding requests', async () => {
      const receivedEvents: workspace.embedding.EmbeddingRequestEvent[] = []
      // Subscribe to embedding requests
      const cleanup = await workspace.subscribeEmbeddingRequests(client, {
        subscriptionName: `embedding-subscriber-${testId}`,
        workspaceId: testEmbeddingWorkspaceId,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish embedding request
      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        workspaceId: testEmbeddingWorkspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        markdownFilename: 'test.md',
        processingTaskId: 'task-1',
        timeoutMs: 5000,
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify
      expect(receivedEvents).toHaveLength(1)
      expect(receivedEvents[0].eventName).toBe('file-embedding-request')
      expect(receivedEvents[0].processingTaskId).toBe('task-1')
      expect(receivedEvents[0].workspaceId).toBe(testEmbeddingWorkspaceId)
      expect(receivedEvents[0].fileEmbeddingOptions.embeddingModelName).toBe('nomic-embed-text')

      await cleanup()
    })

    it('should publish and subscribe to embedding progress events', async () => {
      const receivedEvents: workspace.embedding.EmbeddingProgressEvent[] = []

      const cleanup = await workspace.subscribeEmbeddingProgress(client, {
        subscriptionName: `embedding-progress-subscriber-${testId}`,
        workspaceId: testEmbeddingWorkspaceId,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      await workspace.publishEmbeddingProgress(client, {
        eventName: 'file-embedding-progress',
        timestamp: new Date().toISOString(),
        workspaceId: testEmbeddingWorkspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        processingTaskId: 'task-2',
        timeoutMs: 5000,
        progress: {
          chunksProcessed: 5,
          chunksTotal: 10,
          percentComplete: 50,
          currentOperation: 'Generating embeddings',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(receivedEvents).toHaveLength(1)
      expect(receivedEvents[0].eventName).toBe('file-embedding-progress')
      expect(receivedEvents[0].progress.percentComplete).toBe(50)
      expect(receivedEvents[0].progress.currentOperation).toBe('Generating embeddings')

      await cleanup()
    })

    it('should publish and subscribe to embedding finished events', async () => {
      const receivedEvents: workspace.embedding.EmbeddingFinishedEvent[] = []

      const cleanup = await workspace.subscribeEmbeddingFinished(client, {
        subscriptionName: `embedding-finished-subscriber-${testId}`,
        workspaceId: testEmbeddingWorkspaceId,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      await workspace.publishEmbeddingFinished(client, {
        eventName: 'file-embedding-finished',
        timestamp: new Date().toISOString(),
        workspaceId: testEmbeddingWorkspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        processingTaskId: 'task-3',
        timeoutMs: 5000,
        fileEmbeddingResult: {
          chunkCount: 10,
          chunkSize: 512,
          processingTimeMs: 1500,
          timeout: false,
          partialResult: false,
          success: true,
          notes: 'Embedding completed successfully',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(receivedEvents).toHaveLength(1)
      expect(receivedEvents[0].eventName).toBe('file-embedding-finished')
      expect(receivedEvents[0].fileEmbeddingResult.chunkCount).toBe(10)
      expect(receivedEvents[0].fileEmbeddingResult.success).toBe(true)
      expect(receivedEvents[0].fileEmbeddingResult.notes).toBe('Embedding completed successfully')

      await cleanup()
    })
  })

  describe('Workspace Events - Management', () => {
    const testManagementWorkspaceId = `test-management-workspace-${testId}`
    streams.push(`workspace-${testManagementWorkspaceId}`)
    it('should publish and subscribe to management events', async () => {
      const receivedEvents: workspace.management.WorkspaceManagementEvent[] = []

      const cleanup = await workspace.subscribeManagementEvents(client, {
        subscriptionName: `management-subscriber-${testId}`,
        workspaceId: testManagementWorkspaceId,
        handler: async (event) => {
          receivedEvents.push(event)
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Publish start-processing event
      await workspace.publishManagementEvent(client, {
        workspaceId: testManagementWorkspaceId,
        task: {
          verb: 'start-processing',
          subject: 'embedding',
          details: { reason: 'test' },
        },
      })

      // Publish stop-processing event
      await workspace.publishManagementEvent(client, {
        workspaceId: testManagementWorkspaceId,
        task: {
          verb: 'stop-processing',
          subject: 'embedding',
        },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(receivedEvents).toHaveLength(2)
      expect(receivedEvents[0].eventName).toBe('workspace-management')
      expect(receivedEvents[0].task.verb).toBe('start-processing')
      expect(receivedEvents[0].task.subject).toBe('embedding')
      expect(receivedEvents[1].task.verb).toBe('stop-processing')

      await cleanup()
    })
  })

  describe('Consumer Groups - Load Balancing', () => {
    const testConsumerGroupWorkspaceId = `test-consumer-group-workspace-${testId}`
    streams.push(`workspace-${testConsumerGroupWorkspaceId}`)
    it('should distribute messages across consumer group members', async () => {
      const worker1Events: string[] = []
      const worker2Events: string[] = []
      const workspaceId = testConsumerGroupWorkspaceId

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
          workspaceId,
          libraryId: 'lib-1',
          fileId: `file-${i}`,
          markdownFilename: `test${i}.md`,
          processingTaskId: `task-${i}`,
          timeoutMs: 5000,
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

  describe('Stream Management', () => {
    const testStreamManagementWorkspaceId = `test-stream-management-workspace-${testId}`
    streams.push(`workspace-${testStreamManagementWorkspaceId}`)
    it('should delete workspace stream', async () => {
      const workspaceId = testStreamManagementWorkspaceId

      // Create stream by publishing an event
      await workspace.publishEmbeddingRequest(client, {
        eventName: 'file-embedding-request',
        timestamp: new Date().toISOString(),
        workspaceId,
        libraryId: 'lib-1',
        fileId: 'file-1',
        markdownFilename: 'test.md',
        processingTaskId: 'task-1',
        timeoutMs: 5000,
        fileEmbeddingOptions: {
          embeddingModelName: 'nomic-embed-text',
          embeddingModelProvider: 'ollama',
        },
      })

      // Wait for stream to be created
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Delete the stream - should not throw
      await expect(admin.deleteWorkspaceStream(client, workspaceId)).resolves.not.toThrow()

      // Remove from cleanup list since already deleted
      const index = streams.indexOf(`workspace-${workspaceId}`)
      if (index > -1) {
        streams.splice(index, 1)
      }
    })
  })
})
