import { describe, expect, it } from 'vitest'

import { ChatResponseChunk, OllamaHostConnection } from '@george-ai/app-schema'

import {
  generateOllamaEmbeddings,
  getOllamaChatCompletionStream,
  getOllamaModelInfo,
  getOllamaModels,
  getOllamaRunningModels,
  getOllamaVersion,
  loadOllamaChatModel,
  unloadOllamaChatModel,
} from '.'

// Skip tests if required environment variables are not set (e.g., in Dependabot PRs)
describe.skipIf(!process.env.OLLAMA_BASE_URL || !process.env.MODEL_NAME_CHAT || !process.env.MODEL_NAME_EMBEDDING)(
  'ollama-api tests',
  () => {
    const connection: OllamaHostConnection = {
      baseUrl: process.env.OLLAMA_BASE_URL!,
      encryptedApiKey: process.env.OLLAMA_API_KEY,
      driver: 'ollama',
    }
    const modelNameVL = process.env.MODEL_NAME_VL!
    const modelNameEmbedding = process.env.MODEL_NAME_EMBEDDING!
    const modelNameChat = process.env.MODEL_NAME_CHAT!

    describe('getOllamaVersion', () => {
      it('should fetch version successfully', async () => {
        const result = await getOllamaVersion(connection)

        expect(result).toHaveProperty('timestamp')
        expect(result.timestamp).toBeTypeOf('number')
        expect(result.timestamp).toBeGreaterThan(Date.now() - 5000) // Within last 5 seconds

        expect(result.version).toBeTypeOf('string')
        expect(result.version).toMatch(/^\d+\.\d+\.\d+/) // Version format like 0.1.32
      }, 10000) // 10 second timeout for network calls
    })

    describe('getOllamaModels', () => {
      it('should fetch available models', async () => {
        const result = await getOllamaModels(connection)

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
        await loadOllamaChatModel(connection, modelNameChat)

        const result = await getOllamaRunningModels(connection)

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
        const modelsResult = await getOllamaModels(connection)
        expect(modelsResult.models.length).toBeGreaterThan(0)

        const testModel = modelsResult.models[0]
        const modelInfo = await getOllamaModelInfo(connection, testModel.name)

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
        const modelsResult = await getOllamaModels(connection)
        const model = modelsResult.models.filter((m) => m.name.includes(modelNameChat))[0]

        expect(model).toBeDefined()

        const result = await loadOllamaChatModel(connection, model.name)
        expect(result).toHaveProperty('done')
        expect(result.done).toBeTypeOf('boolean')
      }, 30000)

      it('should unload a model if one is running', async () => {
        const runningModels = await getOllamaRunningModels(connection)
        expect(runningModels.models.length).toBeGreaterThan(0)

        const testModel = runningModels.models[0]
        const result = await unloadOllamaChatModel(connection, testModel.name)

        expect(result).toHaveProperty('done')
        expect(result).toHaveProperty('done_reason')
        expect(result.done).toBeTypeOf('boolean')
      }, 20000)
    })

    describe('embeddings generation', () => {
      it('should generate embeddings if embedding model available', async () => {
        const modelsResult = await getOllamaModels(connection)
        const model = modelsResult.models.filter((m) => m.name.includes(modelNameEmbedding))[0]
        expect(model).toBeDefined()

        const result = await generateOllamaEmbeddings(connection, model.name, 'Hello world')

        expect(result).toHaveProperty('embeddings')
        expect(Array.isArray(result.embeddings)).toBe(true)
        expect(result.embeddings.length).toBe(1)
        expect(result.embeddings[0].chunk).toBe('Hello world')
        expect(result.embeddings[0].vector.length).toBeGreaterThan(0)

        // Test multiple inputs
        const multiResult = await generateOllamaEmbeddings(connection, model.name, ['Hello', 'world', 'Hello', 'all'])

        expect(multiResult.embeddings).toHaveLength(4)
        expect(multiResult.embeddings[0].chunk).toBe('Hello')
        expect(multiResult.embeddings[1].chunk).toBe('world')
        expect(multiResult.embeddings[2].chunk).toBe('Hello')
        expect(multiResult.embeddings[3].chunk).toBe('all')

        expect(multiResult.embeddings[0].vector).toEqual(multiResult.embeddings[2].vector)
        expect(multiResult.embeddings[1].vector).not.toEqual(multiResult.embeddings[3].vector)
      }, 30000)
    })

    describe('chat streaming', () => {
      it('should create chat response stream if chat model available', async () => {
        const stream = await getOllamaChatCompletionStream(connection, modelNameChat, [
          { role: 'user', content: 'Say hello in one word' },
        ])

        expect(stream).toBeDefined()

        // Test that we can read from the stream until completion
        const reader = stream.getReader()
        const chunks: ChatResponseChunk[] = []
        let fullContent = ''

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            if (value && value.completionLine) {
              chunks.push(value)
              fullContent += value.completionLine

              // Validate chunk structure
              expect(typeof value.completionLine).toBe('string')
            }
          }
        } finally {
          reader.releaseLock()
        }

        expect(chunks.length).toBeGreaterThan(0)
        expect(fullContent.length).toBeGreaterThan(0) // Should have received content
      }, 45000)
    })
  },
)
