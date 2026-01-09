import { describe, expect, it } from 'vitest'

import { encryptValue } from '@george-ai/web-utils'

// Your encryption helper

import { getOllamaModels, getOllamaVersion } from './ollama-api'

describe.skipIf(!process.env.OLLAMA_BASE_URL || !process.env.MODEL_NAME_CHAT)(
  'ollama-api integration tests (Encrypted)',
  () => {
    // We encrypt the API key before putting it in the instance object
    // to test the decryption logic inside ollamaApiGet/Post
    const instance = {
      url: process.env.OLLAMA_BASE_URL!,
      apiKey: process.env.OLLAMA_API_KEY ? encryptValue(process.env.OLLAMA_API_KEY) : undefined,
    }

    const modelNameChat = process.env.MODEL_NAME_CHAT!

    describe('getOllamaModels', () => {
      it('should decrypt key and fetch available models', async () => {
        const result = await getOllamaModels(instance)

        expect(Array.isArray(result.models)).toBe(true)
        expect(result.models.find((m) => m.name === modelNameChat)).toBeDefined()
      }, 15000)
    })

    describe('Ollama Encryption Integration', () => {
      it('should successfully call the API using the encrypted key from env', async () => {
        const instance = {
          url: process.env.OLLAMA_BASE_URL!,
          apiKey: process.env.ENCRYPTED_OLLAMA_API_KEY,
        }

        // Internally, this calls decryptValue(instance.apiKey)
        const result = await getOllamaVersion(instance)

        expect(result).toBeDefined()
        expect(result.version).toBeTypeOf('string')

        console.log('Successfully decrypted key and connected to Ollama version:', result.version)
      })
    })

    it('should fail when using the wrong secret to decrypt', async () => {
      const realSecret = process.env.ENCRYPTION_KEY
      process.env.ENCRYPTION_KEY = 'wrong-password-123'

      try {
        const instance = {
          url: process.env.OLLAMA_BASE_URL!,
          apiKey: process.env.ENCRYPTED_OLLAMA_API_KEY,
        }

        await getOllamaVersion(instance)

        // 1. Force a failure if we didn't crash
        throw new Error('SUCCESS_ERROR')
      } catch (err) {
        // 2. Re-throw the error if it's our "SUCCESS_ERROR"
        // This ensures the test runner marks it as a FAILURE.
        if (err instanceof Error && err.message === 'SUCCESS_ERROR') {
          throw new Error('Test failed: The API call should have failed with a wrong secret, but it succeeded.')
        }

        // 3. Otherwise the test "passed" its goal (it failed to connect)
        console.log('Test passed: Access was denied as expected.')
      } finally {
        // 4. Restore real secret
        process.env.ENCRYPTION_KEY = realSecret
      }
    })
  },
)
