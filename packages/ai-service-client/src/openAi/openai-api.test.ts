import { describe, expect, it } from 'vitest'

import { generateOpenAIEmbeddings, getOpenAIModels } from './openai-api'

// Skip tests if required environment variables are not set (e.g., in Dependabot PRs)
describe.skipIf(!process.env.OPENAI_API_KEY)('openai-api integration tests', () => {
  const instance = {
    url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY!,
  }

  describe('getOpenAIModels', () => {
    it('should fetch available models', async () => {
      const result = await getOpenAIModels(instance)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('object')
      expect(result).toHaveProperty('timestamp')
      expect(result.object).toBe('list')
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.timestamp).toBeTypeOf('number')
      expect(result.timestamp).toBeGreaterThan(Date.now() - 5000) // Within last 5 seconds

      // Validate structure of models
      result.data.forEach((model) => {
        expect(model).toHaveProperty('id')
        expect(model).toHaveProperty('object')
        expect(model).toHaveProperty('created')
        expect(model).toHaveProperty('owned_by')
        expect(model.object).toBe('model')
        expect(model.id).toBeTypeOf('string')
        expect(model.created).toBeTypeOf('number')
        expect(model.owned_by).toBeTypeOf('string')
      })

      // Check for common OpenAI models
      const modelIds = result.data.map((m) => m.id)
      const hasEmbeddingModel =
        modelIds.some((id) => id.includes('text-embedding-3')) ||
        modelIds.some((id) => id.includes('text-embedding-ada'))
      const hasChatModel = modelIds.some((id) => id.includes('gpt'))

      expect(hasEmbeddingModel || hasChatModel).toBe(true)
    }, 15000)

    it('should return models with recent timestamps', async () => {
      const result = await getOpenAIModels(instance)

      // Timestamp should be within last 5 seconds
      expect(result.timestamp).toBeGreaterThan(Date.now() - 5000)
      expect(result.timestamp).toBeLessThanOrEqual(Date.now())
    }, 10000)
  })

  describe('generateOpenAIEmbeddings', () => {
    it('should generate embeddings for single input', async () => {
      const modelName = 'text-embedding-3-small'
      const result = await generateOpenAIEmbeddings(instance, modelName, 'Hello world')

      expect(result).toHaveProperty('embeddings')
      expect(result).toHaveProperty('usage')
      expect(Array.isArray(result.embeddings)).toBe(true)
      expect(result.embeddings.length).toBe(1)
      expect(Array.isArray(result.embeddings[0])).toBe(true)
      expect(result.embeddings[0].length).toBeGreaterThan(0)

      // Validate usage data
      expect(result.usage).toHaveProperty('promptTokens')
      expect(result.usage).toHaveProperty('totalTokens')
      expect(result.usage.promptTokens).toBeTypeOf('number')
      expect(result.usage.totalTokens).toBeTypeOf('number')
      expect(result.usage.promptTokens).toBeGreaterThan(0)
      expect(result.usage.totalTokens).toBeGreaterThan(0)
    }, 15000)

    it('should generate embeddings for multiple inputs', async () => {
      const modelName = 'text-embedding-3-small'
      const inputs = ['Hello', 'world', 'test']
      const result = await generateOpenAIEmbeddings(instance, modelName, inputs)

      expect(result.embeddings).toHaveLength(3)
      expect(result.embeddings[0].length).toBeGreaterThan(0)
      expect(result.embeddings[1].length).toBeGreaterThan(0)
      expect(result.embeddings[2].length).toBeGreaterThan(0)

      // All embeddings should have the same dimension
      const dimension = result.embeddings[0].length
      expect(result.embeddings[1].length).toBe(dimension)
      expect(result.embeddings[2].length).toBe(dimension)

      // Usage should reflect multiple inputs
      expect(result.usage.promptTokens).toBeGreaterThan(0)
    }, 20000)

    it('should work with text-embedding-3-large model', async () => {
      const modelName = 'text-embedding-3-large'
      const result = await generateOpenAIEmbeddings(instance, modelName, 'Test embedding')

      expect(result.embeddings).toHaveLength(1)
      expect(result.embeddings[0].length).toBeGreaterThan(0)

      // text-embedding-3-large should have larger dimensions than small
      // Default is 3072 for large, 1536 for small
      expect(result.embeddings[0].length).toBeGreaterThanOrEqual(1536)
    }, 15000)

    it('should handle empty string input', async () => {
      const modelName = 'text-embedding-3-small'
      const result = await generateOpenAIEmbeddings(instance, modelName, '')

      expect(result.embeddings).toHaveLength(1)
      expect(result.embeddings[0].length).toBeGreaterThan(0)
      expect(result.usage.promptTokens).toBeGreaterThanOrEqual(0)
    }, 10000)
  })

  describe('error handling', () => {
    it('should throw error for invalid API key', async () => {
      const invalidInstance = { url: instance.url, apiKey: 'invalid-api-key' }

      await expect(getOpenAIModels(invalidInstance)).rejects.toThrow('Failed to fetch OpenAI API')
    }, 10000)

    it('should throw error for invalid model name in embeddings', async () => {
      await expect(generateOpenAIEmbeddings(instance, 'nonexistent-model:invalid', 'test')).rejects.toThrow(
        'Failed to POST OpenAI API',
      )
    }, 10000)

    it('should throw error for invalid base URL', async () => {
      const invalidInstance = { url: 'http://localhost:99999', apiKey: instance.apiKey }

      await expect(getOpenAIModels(invalidInstance)).rejects.toThrow()
    }, 10000)

    it('should throw error for malformed API endpoint', async () => {
      const invalidInstance = { url: 'not-a-valid-url', apiKey: instance.apiKey }

      await expect(getOpenAIModels(invalidInstance)).rejects.toThrow()
    }, 5000)
  })

  describe('Azure OpenAI compatibility', () => {
    it.skipIf(!process.env.AZURE_OPENAI_ENDPOINT)(
      'should work with Azure OpenAI endpoint if configured',
      async () => {
        const azureInstance = {
          url: process.env.AZURE_OPENAI_ENDPOINT!,
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
        }

        const result = await getOpenAIModels(azureInstance)

        expect(result).toHaveProperty('data')
        expect(Array.isArray(result.data)).toBe(true)
      },
      15000,
    )
  })
})
