import { describe, expect, it } from 'vitest'

import { encryptValue } from '@george-ai/web-utils'

import { getOpenAIModels } from './openai-api'

// Skip if we don't have the API key or the specific encrypted key env var
describe.skipIf(!process.env.OPENAI_API_KEY || !process.env.ENCRYPTED_OPENAI_API_KEY)(
  'openai-api integration tests (Encrypted)',
  () => {
    /**
     * TEST 1: The "Happy Path"
     * This proves that your OpenAI API client correctly handles
     * a key that was encrypted locally before the call.
     */
    describe('Encryption Integration', () => {
      it('should successfully decrypt key and fetch OpenAI models', async () => {
        const instance = {
          url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          // We encrypt it on the fly here to test the flow
          apiKey: encryptValue(process.env.OPENAI_API_KEY!),
        }

        const result = await getOpenAIModels(instance)

        expect(result.object).toBe('list')
        expect(Array.isArray(result.data)).toBe(true)
        expect(result.timestamp).toBeTypeOf('number')
      }, 15000)

      /**
       * TEST 2: Pre-encrypted Key
       * This tests the scenario where the key is already stored
       * as "garbage" text in your environment variables.
       */
      it('should successfully use a pre-encrypted key from environment', async () => {
        const instance = {
          url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          apiKey: process.env.ENCRYPTED_OPENAI_API_KEY!,
        }

        const result = await getOpenAIModels(instance)
        expect(result.data).toBeDefined()
        console.log('Successfully connected to OpenAI using pre-encrypted key')
      }, 15000)
    })

    /**
     * TEST 3: Security Check
     * This proves that if someone changes the ENCRYPTION_KEY,
     * your app correctly fails to authorize with OpenAI.
     */
    it('should fail when using the wrong secret to decrypt the OpenAI key', async () => {
      const realSecret = process.env.ENCRYPTION_KEY

      try {
        // Change the global secret to something incorrect
        process.env.ENCRYPTION_KEY = 'wrong-password-123'

        const instance = {
          url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          apiKey: process.env.ENCRYPTED_OPENAI_API_KEY!,
        }

        await getOpenAIModels(instance)

        // If it doesn't throw, the security failed
        throw new Error('SUCCESS_ERROR')
      } catch (err) {
        if (err instanceof Error && err.message === 'SUCCESS_ERROR') {
          throw new Error('Security Failure: Connection succeeded with the wrong secret!')
        }

        // Any other error (like a 401 Unauthorized) means the test passed
        console.log('Test passed: OpenAI rejected the invalid (garbled) key.')
      } finally {
        // ALWAYS restore the real secret for other tests
        process.env.ENCRYPTION_KEY = realSecret
      }
    })
  },
)
