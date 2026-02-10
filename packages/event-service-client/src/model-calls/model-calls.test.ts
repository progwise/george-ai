import { EmbeddingCall, EmbeddingResponse, ModelCall, ModelResponse } from '.'
import { initializeEventServiceClient, providerHealth } from '..'
import { deleteModelCallConsumer, ensureModelCallConsumer } from './consumers'
import { publishProviderCallEvent } from './publish'
import { directModelCall, respondDirectModelCall } from './request'
import { subscribeModelCalls } from './subscribe'

const TEST_CONFIG = {
  ollama: {
    embeddingModelName: process.env.TEST_OLLAMA_EMBEDDING_MODEL_NAME,
    apiUrl: process.env.TEST_OLLAMA_API_URL,
    apiKey: process.env.TEST_OLLAMA_API_KEY,
  },
}

describe
  .skipIf(!TEST_CONFIG.ollama.apiUrl || !TEST_CONFIG.ollama.apiKey || !TEST_CONFIG.ollama.embeddingModelName)
  .sequential('Model Calls', () => {
    const TEST_WORKSPACE_ID = `test-workspace-provider-calls_${Date.now()}`
    const TEST_PROVIDER_INSTANCE_HEALTH = {
      version: 1 as const,
      workspaceId: TEST_WORKSPACE_ID,
      providerInstance: {
        version: 1 as const,
        modelProvider: 'ollama' as const,
        id: 'test-instance',
        connection: {
          version: 1 as const,
          baseUrl: TEST_CONFIG.ollama.apiUrl!,
          apiKey: TEST_CONFIG.ollama.apiKey!,
        },
      },
      status: 'healthy' as const,
      timestamp: new Date().toISOString(),
      availableModelNames: [TEST_CONFIG.ollama.embeddingModelName!],
      loadedModelNames: [],
      processorUsagePercent: 10,
      totalMemoryMb: 12,
      usedMemoryMb: 4,
    }

    beforeAll(async () => {
      await initializeEventServiceClient()
      await providerHealth.writeProviderInstanceHealth(TEST_PROVIDER_INSTANCE_HEALTH)
    })

    afterAll(async () => {
      await deleteModelCallConsumer({
        workspaceId: TEST_WORKSPACE_ID,
        modelProvider: 'ollama',
        providerInstanceId: 'test-instance',
        eventType: 'call',
      })
    })

    it('Should publish embedding call', async () => {
      await publishProviderCallEvent({
        version: 1,
        modelCallType: 'generateEmbedding',
        provider: 'ollama',
        modelName: TEST_CONFIG.ollama.embeddingModelName!,
        inputTexts: ['This is a test embedding.'],
        workspaceId: TEST_WORKSPACE_ID,
      })
    })

    it('enable workspace for receiving provider calls', async () => {
      await ensureModelCallConsumer({
        workspaceId: TEST_WORKSPACE_ID,
        modelProvider: 'ollama',
        providerInstanceId: 'test-instance',
        eventType: 'call',
        modelNames: [TEST_CONFIG.ollama.embeddingModelName!],
        maxPendingMessages: 0,
      })
    })

    it('Should receive model calls', async () => {
      const receivedCalls: ModelCall[] = []
      const unsubscribe = await subscribeModelCalls({
        handler: async ({ event, providerInstance }) => {
          if (event.workspaceId !== TEST_WORKSPACE_ID) return
          console.log('Received model call event:', { event, providerInstance })
          receivedCalls.push(event)
        },
      })

      await new Promise<void>((resolve) => {
        const checkReceived = () => {
          if (receivedCalls.length >= 1) {
            resolve()
          } else {
            setTimeout(checkReceived, 500)
          }
        }
        checkReceived()
      })

      expect(receivedCalls.length).toBeGreaterThanOrEqual(1)

      await unsubscribe()
    })

    it('Should get response for direct provider call', async () => {
      const modelCall: EmbeddingCall = {
        version: 1,
        modelCallType: 'generateEmbedding',
        provider: 'ollama',
        modelName: TEST_CONFIG.ollama.embeddingModelName!,
        inputTexts: ['This is a direct call test embedding.'],
        workspaceId: TEST_WORKSPACE_ID,
      }

      const responses: ModelResponse[] = []

      const cleanup = await respondDirectModelCall({
        serviceCall: modelCall,
        handler: async ({ event }) => {
          if (event.workspaceId !== TEST_WORKSPACE_ID) {
            throw new Error('Received event for wrong workspace')
          }
          console.log('Handling direct model call event:', { event })
          const healtyService = await providerHealth.getProviderInstanceForDirectCall({
            workspaceId: TEST_WORKSPACE_ID,
            provider: 'ollama',
            modelName: TEST_CONFIG.ollama.embeddingModelName!,
          })
          if (!healtyService) {
            throw new Error('No healthy provider instance found for AI call')
          }
          const result: EmbeddingResponse = {
            modelCallType: 'generateEmbedding',
            resultStatus: 'success',
            embeddings: [[0.1, 0.2, 0.3]],
            version: 1,
            providerInstanceUrl: healtyService.providerInstance.connection.baseUrl || null,
            processingDurationMs: 0,
          }
          responses.push(result)
          return result
        },
      })

      const response = await directModelCall(modelCall, 60000)
      expect(response.modelCallType).toBe('generateEmbedding')
      expect(response.resultStatus).toBe('success')
      expect(responses.length).toBe(1)
      expect(responses[0]).toEqual(response)

      await cleanup()
    })
  })
