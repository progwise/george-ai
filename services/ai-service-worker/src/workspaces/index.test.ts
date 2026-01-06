import { beforeEach, describe, expect, test, vi } from 'vitest'

import { WorkspaceRegistryEntry } from '@george-ai/event-service-client'

import {
  cleanupWorkspaceCache,
  ensureWorkspaceInCache,
  getProviderConfig,
  getWorkspaceEntry,
  removeWorkspaceFromCache,
} from './index'

// Mock the ai-service-client module
vi.mock('@george-ai/ai-service-client', () => ({
  instanceManager: {
    setWorkspaceProviderInstances: vi.fn(),
  },
}))

describe('workspace cache', () => {
  const TEST_WORKSPACE_ID = `test-workspace-123_${Date.now()}`
  const testWorkspaceEntry: WorkspaceRegistryEntry = {
    version: 1,
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

  beforeEach(() => {
    // Clean up cache before each test
    cleanupWorkspaceCache()
  })

  test('should add workspace to cache', async () => {
    await ensureWorkspaceInCache(testWorkspaceEntry)

    const cachedEntry = getWorkspaceEntry(TEST_WORKSPACE_ID)
    expect(cachedEntry).not.toBeUndefined()
    expect(cachedEntry?.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(cachedEntry?.providerInstances).toHaveLength(1)
  })

  test('should get workspace entry from cache', async () => {
    await ensureWorkspaceInCache(testWorkspaceEntry)

    const entry = getWorkspaceEntry(TEST_WORKSPACE_ID)
    expect(entry).toEqual(testWorkspaceEntry)
  })

  test('should return undefined for non-existent workspace', () => {
    const entry = getWorkspaceEntry('non-existent')
    expect(entry).toBeUndefined()
  })

  test('should remove workspace from cache', async () => {
    await ensureWorkspaceInCache(testWorkspaceEntry)
    expect(getWorkspaceEntry(TEST_WORKSPACE_ID)).not.toBeUndefined()

    removeWorkspaceFromCache(TEST_WORKSPACE_ID)
    expect(getWorkspaceEntry(TEST_WORKSPACE_ID)).toBeUndefined()
  })

  test('should handle removing non-existent workspace', () => {
    // Should not throw
    expect(() => removeWorkspaceFromCache('non-existent')).not.toThrow()
  })

  test('should get provider config from cache', async () => {
    await ensureWorkspaceInCache(testWorkspaceEntry)

    const config = getProviderConfig(TEST_WORKSPACE_ID)
    expect(config?.providerInstances).toHaveLength(1)
    expect(config?.providerInstances![0].provider).toBe('ollama')
    expect(config?.languageModels).toHaveLength(1)
    expect(config?.languageModels![0].name).toBe('nomic-embed-text')
  })

  test('should return null for non-existent workspace config', () => {
    const config = getProviderConfig('non-existent')
    expect(config).toBeNull()
  })

  test('should cleanup all workspaces from cache', async () => {
    const TEST_WORKSPACE_ID_2 = `test-workspace-456_${Date.now()}`
    await ensureWorkspaceInCache(testWorkspaceEntry)
    await ensureWorkspaceInCache({
      ...testWorkspaceEntry,
      workspaceId: TEST_WORKSPACE_ID_2,
    })

    expect(getWorkspaceEntry(TEST_WORKSPACE_ID)).toBeDefined()
    expect(getWorkspaceEntry(TEST_WORKSPACE_ID_2)).toBeDefined()
    cleanupWorkspaceCache()

    expect(getWorkspaceEntry(TEST_WORKSPACE_ID)).toBeUndefined()
    expect(getWorkspaceEntry(TEST_WORKSPACE_ID_2)).toBeUndefined()
  })
})
