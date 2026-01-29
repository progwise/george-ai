import { describe, expect, it } from 'vitest'

import {
  OllamaStreamChunk,
  getChatResponseStream,
  getOllamaRunningModels,
  getOllamaVersion,
  loadOllamaModel,
} from './ollama-api'

// Skip tests if required environment variables are not set (e.g., in Dependabot PRs)
describe.skipIf(!process.env.OLLAMA_BASE_URL || !process.env.MODEL_NAME_CHAT || !process.env.MODEL_NAME_EMBEDDING)(
  'ollama encryption tests',
  () => {
    const instance = { url: process.env.OLLAMA_BASE_URL!, apiKey: process.env.ENCRYPTED_OLLAMA_API_KEY }
    const modelNameChat = process.env.MODEL_NAME_CHAT!

    describe('confirmEncrytionsWithGetAndPost', () => {
      it('fetch version successfully with encrypted api key, GET test', async () => {
        const fetchedVersion = await getOllamaVersion(instance)

        expect(fetchedVersion).toHaveProperty('timestamp')
        expect(fetchedVersion.timestamp).toBeGreaterThan(Date.now() - 5000) // Within last 5 seconds
        expect(fetchedVersion.version).toBeTypeOf('string')
        expect(fetchedVersion.version).toBeTypeOf('string')
        expect(fetchedVersion.version).toMatch(/^\d+\.\d+\.\d+/) // Version format like 0.1.32
      }, 10000) // 10 second timeout for network calls

      it(`should fetch running models with loaded, POST test ${modelNameChat}`, async () => {
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

    describe('confirmChatStreaming', () => {
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

      describe('errorHandling', () => {
        it('should fail when using the wrong secret to decrypt', async () => {
          const realSecret = process.env.ENCRYPTION_KEY
          process.env.ENCRYPTION_KEY = '64-hex-character-wrong-password-cuz-one-check-is-32-byte-long-:)'

          await expect(getOllamaVersion(instance)).rejects.toThrow()
          process.env.ENCRYPTION_KEY = realSecret
        }, 10000)

        it('should fail when wrong API key is used', async () => {
          const wrongApiKey = 'encrypted:123456789abcdef012345:6789a:bcdef0123456789abcdef0123456789abcdef'
          const wrongInstance = { url: instance.url, apiKey: wrongApiKey }
          await expect(getOllamaVersion(wrongInstance)).rejects.toThrow()
        }, 10000)
      })
    })
  },
)
