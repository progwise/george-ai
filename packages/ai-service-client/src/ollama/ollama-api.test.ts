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

// Skip tests if required environment variables are not set (e.g., in Dependabot PRs)
describe.skipIf(!process.env.OLLAMA_BASE_URL || !process.env.MODEL_NAME_CHAT || !process.env.MODEL_NAME_EMBEDDING)(
  'ollama-api integration tests',
  () => {
    const instance = { url: process.env.OLLAMA_BASE_URL!, apiKey: process.env.OLLAMA_API_KEY }
    const modelNameVL = process.env.MODEL_NAME_VL!
    const modelNameEmbedding = process.env.MODEL_NAME_EMBEDDING!
    const modelNameChat = process.env.MODEL_NAME_CHAT!

    // Debug: Check if API key is provided
    console.log('🔍 OLLAMA_API_KEY debug:', {
      isDefined: process.env.OLLAMA_API_KEY !== undefined,
      isEmpty: process.env.OLLAMA_API_KEY === '',
      length: process.env.OLLAMA_API_KEY?.length || 0,
    })

    describe('getOllamaVersion', () => {
      it('should fetch version successfully', async () => {
        const result = await getOllamaVersion(instance)

        expect(result).toHaveProperty('timestamp')
        expect(result.timestamp).toBeTypeOf('number')
        expect(result.timestamp).toBeGreaterThan(Date.now() - 5000) // Within last 5 seconds

        expect(result.version).toBeTypeOf('string')
        expect(result.version).toMatch(/^\d+\.\d+\.\d+/) // Version format like 0.1.32
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

        expect(result.models.find((m) => m.name === modelNameChat)).toBeDefined()
        expect(result.models.find((m) => m.name === modelNameVL)).toBeDefined()
        expect(result.models.find((m) => m.name === modelNameEmbedding)).toBeDefined()
      }, 15000)
    })

    describe('getOllamaRunningModels', () => {
      it(`should fetch running models with loaded ${modelNameChat}`, async () => {
        await loadOllamaModel(instance, modelNameChat)

        const result = await getOllamaRunningModels(instance)

        expect(result).toHaveProperty('models')
        expect(result).toHaveProperty('timestamp')
        expect(Array.isArray(result.models)).toBe(true)
        expect(result.timestamp).toBeTypeOf('number')
        expect(result.models.length).toBeGreaterThan(0) // Could be zero

        expect(result.models.find((m) => m.name === modelNameChat)).toBeDefined()

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
        const model = modelsResult.models.filter((m) => m.name.includes(modelNameChat))[0]

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
        const model = modelsResult.models.filter((m) => m.name.includes(modelNameEmbedding))[0]
        expect(model).toBeDefined()

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
        const stream = await getChatResponseStream(instance, modelNameChat, [
          { role: 'user', content: 'Say hello in one word' },
        ])

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

              // Fail immediately on error chunks
              expect(value.error).toBeUndefined()
              expect(typeof value.message?.content).toBe('string')
            }
          }
        } finally {
          reader.releaseLock()
        }

        expect(chunks.length).toBeGreaterThan(0)
        expect(chunks[chunks.length - 1].done).toBe(true) // Last chunk MUST be done
      }, 45000)
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
  },
)
