import { afterAll, describe, expect, test } from 'vitest'

import {
  ManagementEvent,
  ManagementEventType,
  WorkspaceEvent,
  WorkspaceEventType,
  getWorkerRegistryEntry,
  getWorkspaceRegistryEntry,
  publishManagementEvent,
  publishWorkspaceEvent,
  putWorkerRegistryEntry,
  putWorkspaceRegistryEntry,
  subscribeManagementEvent,
  subscribeWorkspaceEvent,
} from './index'

describe('event-service-client integration tests', () => {
  let managementCleanup: (() => Promise<void>) | undefined
  let workspaceCleanup: (() => Promise<void>) | undefined

  const TEST_WORKSPACE_ID = `test-workspace-123_${Date.now()}`
  const TEST_WORKER_ID = `test-worker-123_${Date.now()}`

  afterAll(async () => {
    if (managementCleanup) await managementCleanup()
    if (workspaceCleanup) await workspaceCleanup()
  })

  test('should publish and receive management event', async () => {
    let receivedEvent: ManagementEvent | null = null

    // Subscribe first
    managementCleanup = await subscribeManagementEvent({
      workspaceId: TEST_WORKSPACE_ID,
      eventTypes: [ManagementEventType.StartEmbedding],
      handler: (event) => {
        receivedEvent = event
        return Promise.resolve()
      },
    })

    // Publish event
    await publishManagementEvent({
      version: 1,
      eventType: ManagementEventType.StartEmbedding,
      workspaceId: TEST_WORKSPACE_ID,
    })

    // Wait for event to be received (with timeout)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(receivedEvent).not.toBeNull()
    expect(receivedEvent!.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(receivedEvent!.eventType).toBe(ManagementEventType.StartEmbedding)
    expect(receivedEvent!.version).toBe(1)
  })

  test('should publish and receive workspace event', async () => {
    let receivedEvent: WorkspaceEvent | null = null

    // Subscribe first
    workspaceCleanup = await subscribeWorkspaceEvent({
      workspaceId: TEST_WORKSPACE_ID,
      eventTypes: [WorkspaceEventType.EmbeddingRequest],
      handler: (event) => {
        receivedEvent = event
        return Promise.resolve()
      },
    })

    // Publish embedding request event
    await publishWorkspaceEvent({
      version: 1,
      eventType: WorkspaceEventType.EmbeddingRequest,
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: 'test-library-123',
      fileId: 'test-file-123',
      markdownFilename: 'test.md',
      embeddingModelProvider: 'ollama',
      embeddingModelName: 'nomic-embed-text',
    })

    // Wait for event to be received (with timeout)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(receivedEvent).not.toBeNull()
    expect(receivedEvent!.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(receivedEvent!.eventType).toBe(WorkspaceEventType.EmbeddingRequest)
    expect(receivedEvent!.libraryId).toBe('test-library-123')
    expect(receivedEvent!.fileId).toBe('test-file-123')
  })

  test('should put and get workspace registry entry', async () => {
    const testEntry = {
      version: 1 as const,
      workspaceId: TEST_WORKSPACE_ID,
      lastUpdate: new Date().toISOString(),
      providerInstances: [
        {
          id: 'provider-1',
          provider: 'ollama',
          baseUrl: 'http://ollama:11434',
        },
      ],
      languageModels: [
        {
          id: 'model-1',
          name: 'nomic-embed-text',
          provider: 'ollama',
          canDoEmbedding: true,
          canDoChatCompletion: false,
          canDoVision: false,
          canDoFunctionCalling: false,
        },
      ],
    }

    // Put entry
    await putWorkspaceRegistryEntry(testEntry)

    // Get entry
    const retrievedEntry = await getWorkspaceRegistryEntry(TEST_WORKSPACE_ID)

    expect(retrievedEntry).not.toBeNull()
    expect(retrievedEntry?.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(retrievedEntry?.providerInstances).toHaveLength(1)
    expect(retrievedEntry?.providerInstances[0].provider).toBe('ollama')
    expect(retrievedEntry?.languageModels).toHaveLength(1)
    expect(retrievedEntry?.languageModels[0].name).toBe('nomic-embed-text')
  })

  test('should put and get worker registry entry', async () => {
    const testEntry = {
      version: 1 as const,
      workerId: TEST_WORKER_ID,
      activeSubscriptions: [TEST_WORKSPACE_ID],
      lastHeartbeat: new Date().toISOString(),
    }

    // Put entry
    await putWorkerRegistryEntry(testEntry)

    // Get entry
    const retrievedEntry = await getWorkerRegistryEntry(TEST_WORKER_ID)

    expect(retrievedEntry).not.toBeNull()
    expect(retrievedEntry?.workerId).toBe(TEST_WORKER_ID)
    expect(retrievedEntry?.activeSubscriptions).toHaveLength(1)
    expect(retrievedEntry?.activeSubscriptions[0]).toBe(TEST_WORKSPACE_ID)
  })
})
