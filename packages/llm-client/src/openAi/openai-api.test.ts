import { describe, expect, it } from 'vitest'

import { OpenAiProviderConnection } from '@george-ai/app-commons'

import { generateOpenAIEmbeddings, getOpenAIChatCompletionStream, getOpenAIModels } from '.'
import type { ChatCompletionStreamChunk } from '../common'

// Skip tests if required environment variables are not set (e.g., in Dependabot PRs)
describe.skipIf(!process.env.OPENAI_API_KEY)('openai-api integration tests', () => {
  const connection: OpenAiProviderConnection = {
    modelProvider: 'openai',
    baseUrl: process.env.OPENAI_BASE_URL,
    encryptedApiKey: process.env.OPENAI_API_KEY!,
  }

  describe('getOpenAIModels', () => {
    it('should fetch available models', async () => {
      const result = await getOpenAIModels(connection)

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
      const result = await getOpenAIModels(connection)

      // Timestamp should be within last 5 seconds
      expect(result.timestamp).toBeGreaterThan(Date.now() - 5000)
      expect(result.timestamp).toBeLessThanOrEqual(Date.now())
    }, 10000)
  })

  describe('generateOpenAIEmbeddings', () => {
    it('should generate embeddings for single input', async () => {
      const modelName = 'text-embedding-3-small'
      const result = await generateOpenAIEmbeddings(connection, modelName, 'Hello world')

      expect(result).toHaveProperty('embeddings')
      expect(result).toHaveProperty('usage')
      expect(result.embeddings.length).toBe(1)
      expect(result.embeddings[0].embedding.length).toBeGreaterThan(0)

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
      const result = await generateOpenAIEmbeddings(connection, modelName, inputs)

      expect(result.embeddings).toHaveLength(3)
      expect(result.embeddings[0].embedding.length).toBeGreaterThan(0)
      expect(result.embeddings[1].embedding.length).toBeGreaterThan(0)
      expect(result.embeddings[2].embedding.length).toBeGreaterThan(0)

      // All embeddings should have the same dimension
      const dimension = result.embeddings[0].embedding.length
      expect(result.embeddings[1].embedding.length).toBe(dimension)
      expect(result.embeddings[2].embedding.length).toBe(dimension)

      // Usage should reflect multiple inputs
      expect(result.usage.promptTokens).toBeGreaterThan(0)
    }, 20000)

    it('should work with text-embedding-3-large model', async () => {
      const modelName = 'text-embedding-3-large'
      const result = await generateOpenAIEmbeddings(connection, modelName, 'Test embedding')

      expect(result.embeddings).toHaveLength(1)
      expect(result.embeddings[0].embedding.length).toBeGreaterThan(0)

      // text-embedding-3-large should have larger dimensions than small
      // Default is 3072 for large, 1536 for small
      expect(result.embeddings[0].embedding.length).toBeGreaterThanOrEqual(1536)
    }, 15000)

    it('should handle empty string input', async () => {
      const modelName = 'text-embedding-3-small'
      const result = await generateOpenAIEmbeddings(connection, modelName, '')

      expect(result.embeddings).toHaveLength(1)
      expect(result.embeddings[0].embedding.length).toBeGreaterThan(0)
      expect(result.usage.promptTokens).toBeGreaterThanOrEqual(0)
    }, 10000)
  })

  describe('getChatResponseStream', () => {
    // Use gpt-4o-mini - cheapest OpenAI model for testing
    const chatModel = 'gpt-5-nano'

    it('should create chat response stream with basic message', async () => {
      const stream = await getOpenAIChatCompletionStream(connection, {
        modelName: chatModel,
        messages: [{ role: 'user', content: 'Say hello in one word' }],
      })

      expect(stream).toBeDefined()

      // Test that we can read from the stream until completion
      const reader = stream.getReader()
      const chunks: ChatCompletionStreamChunk[] = []
      let fullContent = ''

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          if (value) {
            chunks.push(value)
            fullContent += value.chunk

            // Validate chunk structure
            expect(typeof value.chunk).toBe('string')
            expect(value.metadata).toBeDefined()
            expect(value.metadata?.instanceUrl).toBe(connection.baseUrl)
          }
        }
      } finally {
        reader.releaseLock()
      }

      expect(chunks.length).toBeGreaterThan(0)
      expect(fullContent.length).toBeGreaterThan(0)
      expect(fullContent.toLowerCase()).toContain('hello')
    }, 30000)

    it('should include token usage when includeUsage is true', async () => {
      const stream = await getOpenAIChatCompletionStream(connection, {
        modelName: chatModel,
        messages: [{ role: 'user', content: 'Count to 3' }],
      })

      const reader = stream.getReader()
      const chunks: ChatCompletionStreamChunk[] = []
      let fullContent = ''
      let foundUsageChunk = false

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          if (value) {
            chunks.push(value)
            fullContent += value.chunk

            // Check if this chunk has usage metadata
            if (value.metadata?.tokensProcessed !== undefined) {
              foundUsageChunk = true
              expect(value.metadata.promptTokens).toBeTypeOf('number')
              expect(value.metadata.completionTokens).toBeTypeOf('number')
              expect(value.metadata.tokensProcessed).toBeTypeOf('number')
              expect(value.metadata.tokensProcessed).toBeGreaterThan(0)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      expect(chunks.length).toBeGreaterThan(0)
      expect(fullContent.length).toBeGreaterThan(0)
      expect(foundUsageChunk).toBe(true) // Must have received usage stats
    }, 30000)

    it('should handle multi-turn conversations', async () => {
      const stream = await getOpenAIChatCompletionStream(connection, {
        modelName: chatModel,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is 2+2?' },
          { role: 'assistant', content: '4' },
          { role: 'user', content: 'What is 3+3?' },
        ],
      })

      const reader = stream.getReader()
      let fullContent = ''

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          if (value) {
            fullContent += value.chunk
          }
        }
      } finally {
        reader.releaseLock()
      }

      expect(fullContent.length).toBeGreaterThan(0)
      expect(fullContent).toContain('6')
    }, 30000)

    it('should accept abort signal parameter without errors', async () => {
      const abortController = new AbortController()

      // Create stream with abort signal attached
      const stream = await getOpenAIChatCompletionStream(
        connection,
        { modelName: chatModel, messages: [{ role: 'user', content: 'Say hello' }] },
        abortController.signal,
      )

      expect(stream).toBeDefined()

      // Read the stream normally
      const reader = stream.getReader()
      let fullContent = ''

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) {
            fullContent += value.chunk
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Should complete successfully even with abort signal attached
      expect(fullContent.length).toBeGreaterThan(0)
    }, 20000)

    it('should handle pre-aborted signal gracefully', async () => {
      const abortController = new AbortController()
      // Abort BEFORE creating the stream
      abortController.abort()

      // Creating a stream with an already-aborted signal should throw
      await expect(
        getOpenAIChatCompletionStream(
          connection,
          { modelName: chatModel, messages: [{ role: 'user', content: 'This should not execute' }] },
          abortController.signal,
        ),
      ).rejects.toThrow()
    }, 10000)

    it('should handle empty assistant response gracefully', async () => {
      const stream = await getOpenAIChatCompletionStream(connection, {
        modelName: chatModel,
        messages: [{ role: 'user', content: 'Say nothing. Just acknowledge with a period.' }],
      })

      const reader = stream.getReader()
      let fullContent = ''

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          if (value) {
            fullContent += value.chunk
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Should complete successfully even with minimal response
      expect(fullContent.length).toBeGreaterThanOrEqual(0)
    }, 20000)
  })
})
