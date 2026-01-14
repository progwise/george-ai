import { describe, expect, it } from 'vitest'

import { generateOpenAIEmbeddings, getOpenAIModels } from './openai-api'

// Skip tests if required environment variables are not set (e.g., in Dependabot PRs)
describe.skipIf(!process.env.ENCRYPTED_OPENAI_API_KEY)('openai-api integration tests', () => {
  const instance = {
    url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.ENCRYPTED_OPENAI_API_KEY!,
  }

  describe('confirmEncryptionWithGetAndPost', () => {
    it('should fetch available models, GET test', async () => {
      const fetchedModels = await getOpenAIModels(instance)

      expect(fetchedModels).toHaveProperty('data')
      expect(fetchedModels).toHaveProperty('object')
      expect(fetchedModels).toHaveProperty('timestamp')
      expect(fetchedModels.object).toBe('list')
      expect(Array.isArray(fetchedModels.data)).toBe(true)
      expect(fetchedModels.timestamp).toBeTypeOf('number')
      expect(fetchedModels.timestamp).toBeGreaterThan(Date.now() - 5000) // Within last 5 seconds

      // Validate structure of models
      fetchedModels.data.forEach((model) => {
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
      const modelIds = fetchedModels.data.map((m) => m.id)
      const hasEmbeddingModel =
        modelIds.some((id) => id.includes('text-embedding-3')) ||
        modelIds.some((id) => id.includes('text-embedding-ada'))
      const hasChatModel = modelIds.some((id) => id.includes('gpt'))

      expect(hasEmbeddingModel || hasChatModel).toBe(true)
    }, 15000)

    it('should generate embeddings for single input, POST test', async () => {
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
  })

  describe('errorHandling', () => {
    it('should throw error for invalid API key', async () => {
      const invalidInstance = {
        url: instance.url,
        apiKey: 'encrypted:123456789abcdef012345:6789a:bcdef0123456789abcdef0123456789abcdef',
      }

      await expect(getOpenAIModels(invalidInstance)).rejects.toThrow()
    }, 10000)
  })
})
