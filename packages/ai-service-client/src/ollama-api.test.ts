import { describe, expect, it } from 'vitest'

import {
  type OllamaStreamChunk,
  generateOllamaEmbeddings,
  getChatResponseStream,
  getOllamaModelInfo,
  getOllamaModels,
  getOllamaRunningModels,
  getOllamaVersion,
  loadOllamaModel,
  unloadOllamaModel,
} from './ollama-api'

describe('ollama-api integration tests', () => {
  const testInstances = [
    { url: 'http://host.docker.internal:11434', name: 'docker-internal' },
    { url: 'http://ollama-api.george-ai.net:11434', name: 'george-ai-net' },
  ]

  // Test each instance
  testInstances.forEach(({ url, name }) => {
    describe(`${name} (${url})`, () => {
      const instance = { url }

      describe('getOllamaVersion', () => {
        it('should fetch version successfully', async () => {
          const result = await getOllamaVersion(instance)

          expect(result).toHaveProperty('timestamp')
          expect(result.timestamp).toBeTypeOf('number')
          expect(result.timestamp).toBeGreaterThan(Date.now() - 5000) // Within last 5 seconds

          if (result.version) {
            expect(result.version).toBeTypeOf('string')
            expect(result.version).toMatch(/^\d+\.\d+\.\d+/) // Version format like 0.1.32
          }
        }, 10000) // 10 second timeout for network calls
      })

      describe('getOllamaModels', () => {
        it('should fetch available models', async () => {
          const result = await getOllamaModels(instance)

          expect(result).toHaveProperty('models')
          expect(result).toHaveProperty('timestamp')
          expect(Array.isArray(result.models)).toBe(true)
          expect(result.timestamp).toBeTypeOf('number')

          // If models exist, validate structure
          result.models.forEach((model) => {
            expect(model).toHaveProperty('name')
            expect(model).toHaveProperty('model')
            expect(model).toHaveProperty('size')
            expect(model.name).toBeTypeOf('string')
            expect(model.model).toBeTypeOf('string')
            expect(model.size).toBeTypeOf('number')
          })
        }, 15000)
      })

      describe('getOllamaRunningModels', () => {
        it('should fetch running models', async () => {
          const result = await getOllamaRunningModels(instance)

          expect(result).toHaveProperty('models')
          expect(result).toHaveProperty('timestamp')
          expect(Array.isArray(result.models)).toBe(true)
          expect(result.timestamp).toBeTypeOf('number')

          // If running models exist, validate structure
          result.models.forEach((model) => {
            expect(model).toHaveProperty('name')
            expect(model).toHaveProperty('model')
            expect(model).toHaveProperty('size')
            expect(model).toHaveProperty('size_vram')
            expect(model).toHaveProperty('expires_at')
            expect(model.name).toBeTypeOf('string')
            expect(model.size_vram).toBeTypeOf('number')
          })
        }, 15000)
      })

      describe('model operations', () => {
        // These tests require specific models to be available
        // We'll test with common models that might be present

        it('should get model info for available models', async () => {
          // First get available models
          const modelsResult = await getOllamaModels(instance)
          expect(modelsResult.models.length).toBeGreaterThan(0)

          const testModel = modelsResult.models[0]
          const modelInfo = await getOllamaModelInfo(instance, testModel.name)

          expect(modelInfo).toHaveProperty('modelfile')
          expect(modelInfo).toHaveProperty('template')
          expect(modelInfo).toHaveProperty('details')
          expect(modelInfo).toHaveProperty('model_info')
          expect(modelInfo).toHaveProperty('timestamp')

          expect(modelInfo.modelfile).toBeTypeOf('string')
          expect(modelInfo.details).toHaveProperty('family')
          expect(modelInfo.details).toHaveProperty('parameter_size')

          // Parameters is optional in some models
          if (modelInfo.parameters) {
            expect(modelInfo.parameters).toBeTypeOf('string')
          }
        }, 20000)

        it('should load a small model if available', async () => {
          // First check if any common small models are available
          const modelsResult = await getOllamaModels(instance)
          const model = modelsResult.models.filter((m) => m.name.includes('qwen2.5'))[0]

          expect(model).toBeDefined()

          const result = await loadOllamaModel(instance, model.name)
          expect(result).toHaveProperty('done')
          expect(result.done).toBeTypeOf('boolean')
        }, 30000)

        it('should unload a model if one is running', async () => {
          const runningModels = await getOllamaRunningModels(instance)
          expect(runningModels.models.length).toBeGreaterThan(0)

          const testModel = runningModels.models[0]
          const result = await unloadOllamaModel(instance, testModel.name)

          expect(result).toHaveProperty('done')
          expect(result).toHaveProperty('done_reason')
          expect(result.done).toBeTypeOf('boolean')
        }, 20000)
      })

      describe('embeddings generation', () => {
        it('should generate embeddings if embedding model available', async () => {
          const modelsResult = await getOllamaModels(instance)
          const model = modelsResult.models.filter((m) => m.name.includes('bge-m3'))[0]
          expect(model).toBeDefined()

          // Look for common embedding models
          const embeddingModels = ['nomic-embed-text', 'mxbai-embed-large', 'all-minilm']
          const availableEmbeddingModel = modelsResult.models.find((model) =>
            embeddingModels.some((embModel) => model.name.includes(embModel)),
          )
          expect(availableEmbeddingModel).toBeDefined()

          const result = await generateOllamaEmbeddings(instance, model.name, 'Hello world')

          expect(result).toHaveProperty('embeddings')
          expect(Array.isArray(result.embeddings)).toBe(true)
          expect(result.embeddings.length).toBe(1)
          expect(Array.isArray(result.embeddings[0])).toBe(true)
          expect(result.embeddings[0].length).toBeGreaterThan(0)

          // Test multiple inputs
          const multiResult = await generateOllamaEmbeddings(instance, model.name, ['Hello', 'world'])

          expect(multiResult.embeddings).toHaveLength(2)
          expect(multiResult.embeddings[0]).toHaveLength(result.embeddings[0].length)
        }, 30000)
      })

      describe('chat streaming', () => {
        it('should create chat response stream if chat model available', async () => {
          const modelsResult = await getOllamaModels(instance)
          const model = modelsResult.models.filter((m) => m.name.includes('qwen2.5vl'))[0]
          expect(model).toBeDefined()
          const stream = await getChatResponseStream(instance, model.name, 'Say hello in one word', [])

          expect(stream).toBeDefined()

          // Test that we can read from the stream until completion
          const reader = stream.getReader()
          const chunks: OllamaStreamChunk[] = []

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break

              if (value) {
                chunks.push(value)

                if (value.response) {
                  expect(typeof value.response).toBe('string')
                }

                if (value.error) {
                  expect(typeof value.error).toBe('string')
                }
              }
            }
          } finally {
            reader.releaseLock()
          }

          expect(chunks.length).toBeGreaterThan(0)
          expect(chunks[chunks.length - 1].done).toBe(true) // Last chunk MUST be done
        }, 45000)

        it('should create chat response stream with valid images', async () => {
          const modelsResult = await getOllamaModels(instance)
          const model = modelsResult.models.filter((m) => m.name.includes('qwen2.5vl'))[0]
          expect(model).toBeDefined()

          // Use the proper test image
          const validImage = test_base64_image.split(',')[1] // Remove the data:image/png;base64, prefix

          const stream = await getChatResponseStream(instance, model.name, 'What color is this image?', [validImage])

          expect(stream).toBeDefined()

          // Test that we can read from the stream until completion
          const reader = stream.getReader()
          const chunks: OllamaStreamChunk[] = []
          let totalContent = ''
          let hasError = false

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break

              if (value) {
                chunks.push(value)

                if (value.response) {
                  totalContent += value.response
                  expect(typeof value.response).toBe('string')
                }

                if (value.error) {
                  hasError = true
                  expect(typeof value.error).toBe('string')
                  console.log('Stream error received:', value.error)
                }
              }
            }
            console.log('Vision model response:', totalContent)
          } finally {
            reader.releaseLock()
          }

          expect(chunks.length).toBeGreaterThan(0)
          expect(chunks[chunks.length - 1].done).toBe(true) // Last chunk MUST be done
          expect(hasError).toBe(false) // Should not have errors with valid image
          expect(totalContent.length).toBeGreaterThan(0) // Should have actual response
        }, 60000)

        it('should handle stream errors when processing invalid images', async () => {
          const modelsResult = await getOllamaModels(instance)
          const model = modelsResult.models.filter((m) => m.name.includes('qwen2.5vl'))[0]
          expect(model).toBeDefined()

          // Use the problematic image that causes "too much pixel data" error
          const invalidImage =
            'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIHWP8//8/AzYwiqHBgA0OAABCWgEHw8oWBQAAAABJRU5ErkJggg=='

          const stream = await getChatResponseStream(
            instance,
            model.name,
            'Describe what you see in this image briefly',
            [invalidImage],
          )

          expect(stream).toBeDefined()

          // Test that we can read from the stream until completion
          const reader = stream.getReader()
          const chunks: OllamaStreamChunk[] = []
          let totalContent = ''
          let hasError = false

          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break

              if (value) {
                chunks.push(value)

                if (value.response) {
                  totalContent += value.response
                  expect(typeof value.response).toBe('string')
                }

                if (value.error) {
                  hasError = true
                  expect(typeof value.error).toBe('string')
                  console.log('Stream error received:', value.error)
                }
              }
            }
            console.log('Total content received:', totalContent)
          } finally {
            reader.releaseLock()
          }

          expect(chunks.length).toBeGreaterThan(0)

          // This test specifically uses a bad image to test error handling
          expect(hasError).toBe(true) // We expect an error with the invalid image

          // Error-only chunks might not have done field, which is a known Ollama API issue
          const lastChunk = chunks[chunks.length - 1]
          if (lastChunk.error && !lastChunk.done) {
            console.log('Error-only chunk detected (missing done field):', lastChunk.error)
          } else {
            expect(lastChunk.done).toBe(true)
          }
        }, 60000)
      })

      describe('error handling', () => {
        it('should throw error for invalid model names', async () => {
          await expect(getOllamaModelInfo(instance, 'nonexistent-model:invalid')).rejects.toThrow(
            'Failed to POST OLLAMA API',
          )
        }, 10000)

        it('should throw error for invalid endpoints', async () => {
          const invalidInstance = { url: 'http://localhost:99999' }
          await expect(getOllamaVersion(invalidInstance)).rejects.toThrow()
        }, 5000)
      })
    })
  })

  describe('cross-instance comparison', () => {
    it('should be able to compare versions across instances', async () => {
      const results = await Promise.allSettled(
        testInstances.map(async ({ url, name }) => {
          try {
            const version = await getOllamaVersion({ url })
            return { name, version: version.version, success: true }
          } catch (error: unknown) {
            return { name, error: error instanceof Error ? error.message : String(error), success: false }
          }
        }),
      )

      // At least one instance should be reachable for meaningful tests
      const successfulResults = results
        .filter(
          (result): result is PromiseFulfilledResult<{ name: string; version: string | undefined; success: true }> =>
            result.status === 'fulfilled' && result.value.success,
        )
        .map((result) => result.value)

      if (successfulResults.length > 0) {
        console.log('Successful connections:', successfulResults)
        successfulResults.forEach((result) => {
          expect(result.success).toBe(true)
        })
      } else {
        console.warn('No Ollama instances were reachable during testing')
      }
    }, 20000)
  })
})

const test_base64_image =
  'data:image/png;base64,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'
