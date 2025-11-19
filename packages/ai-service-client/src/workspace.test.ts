import { beforeEach, describe, expect, it } from 'vitest'

import { discoverModels, testOllamaConnection, testOpenAIConnection } from './index'
import { providerCache } from './provider-cache'
import type { ServiceProviderConfig } from './types'

// Skip tests if required environment variables are not set
describe.skipIf(!process.env.OLLAMA_BASE_URL)('Ollama workspace functions', () => {
  const ollamaUrl = process.env.OLLAMA_BASE_URL!
  const ollamaApiKey = process.env.OLLAMA_API_KEY

  describe('testOllamaConnection', () => {
    it('should successfully connect to Ollama', async () => {
      const result = await testOllamaConnection({ url: ollamaUrl, apiKey: ollamaApiKey })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail with invalid URL', async () => {
      const result = await testOllamaConnection({ url: 'http://invalid-host:11434' })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('discoverModels for Ollama', () => {
    const mockWorkspaceProviders: ServiceProviderConfig[] = [
      {
        provider: 'ollama',
        endpoints: [{ name: 'Test Ollama', url: ollamaUrl, apiKey: ollamaApiKey, vramGB: 16 }],
      },
    ]

    beforeEach(() => {
      // Initialize cache with mock workspace provider
      providerCache.initialize(async () => mockWorkspaceProviders)
      providerCache.clearAll()
    })

    it('should discover models from Ollama workspace', async () => {
      const models = await discoverModels('test-workspace', 'ollama')

      expect(Array.isArray(models)).toBe(true)
      expect(models.length).toBeGreaterThan(0)
      // Models should be strings
      models.forEach((model) => {
        expect(typeof model).toBe('string')
      })
    })

    it('should deduplicate models from multiple instances', async () => {
      // Configure two endpoints pointing to same Ollama instance
      const duplicateProviders: ServiceProviderConfig[] = [
        {
          provider: 'ollama',
          endpoints: [
            { name: 'Ollama 1', url: ollamaUrl, apiKey: ollamaApiKey, vramGB: 16 },
            { name: 'Ollama 2', url: ollamaUrl, apiKey: ollamaApiKey, vramGB: 16 },
          ],
        },
      ]

      providerCache.clearAll()
      providerCache.initialize(async () => duplicateProviders)

      const models = await discoverModels('test-workspace', 'ollama')

      // Should have unique models (deduplicated)
      const uniqueModels = new Set(models)
      expect(models.length).toBe(uniqueModels.size)
    })
  })
})

describe.skipIf(!process.env.OPENAI_API_KEY)('OpenAI workspace functions', () => {
  const openaiApiKey = process.env.OPENAI_API_KEY!

  describe('testOpenAIConnection', () => {
    it('should successfully connect to OpenAI', async () => {
      const result = await testOpenAIConnection({ apiKey: openaiApiKey })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail with invalid API key', async () => {
      const result = await testOpenAIConnection({ apiKey: 'sk-invalid-key' })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('discoverModels for OpenAI', () => {
    const mockWorkspaceProviders: ServiceProviderConfig[] = [
      {
        provider: 'openai',
        endpoints: [{ name: 'Test OpenAI', apiKey: openaiApiKey, vramGB: 0 }],
      },
    ]

    beforeEach(() => {
      providerCache.initialize(async () => mockWorkspaceProviders)
      providerCache.clearAll()
    })

    it('should discover models from OpenAI workspace', async () => {
      const models = await discoverModels('test-workspace', 'openai')

      expect(Array.isArray(models)).toBe(true)
      expect(models.length).toBeGreaterThan(0)

      // Should include common OpenAI models
      const modelNames = models.join(',')
      expect(modelNames.includes('gpt') || modelNames.includes('embedding') || modelNames.includes('davinci')).toBe(
        true,
      )
    })
  })
})

describe('Provider cache integration', () => {
  const mockProviders: ServiceProviderConfig[] = [
    {
      provider: 'ollama',
      endpoints: [{ name: 'Test', url: 'http://test:11434', vramGB: 16 }],
    },
  ]

  beforeEach(() => {
    providerCache.clearAll()
  })

  it('should cache providers per workspace', async () => {
    let loadCount = 0
    const loader = async (workspaceId: string) => {
      loadCount++
      return workspaceId === 'workspace-1' ? mockProviders : []
    }

    providerCache.initialize(loader)

    // First call loads
    await providerCache.getProviders('workspace-1')
    expect(loadCount).toBe(1)

    // Second call uses cache
    await providerCache.getProviders('workspace-1')
    expect(loadCount).toBe(1)

    // Different workspace loads separately
    await providerCache.getProviders('workspace-2')
    expect(loadCount).toBe(2)
  })

  it('should invalidate workspace cache', async () => {
    let loadCount = 0
    const loader = async () => {
      loadCount++
      return mockProviders
    }

    providerCache.initialize(loader)

    await providerCache.getProviders('workspace-1')
    expect(loadCount).toBe(1)

    // Invalidate and reload
    providerCache.invalidate('workspace-1')
    await providerCache.getProviders('workspace-1')
    expect(loadCount).toBe(2)
  })

  it('should provide cache statistics', async () => {
    providerCache.initialize(async () => mockProviders)

    await providerCache.getProviders('workspace-1')
    await providerCache.getProviders('workspace-2')

    const stats = providerCache.getStats()
    expect(stats.size).toBe(2)
  })
})
