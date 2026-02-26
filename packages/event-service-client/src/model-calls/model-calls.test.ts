import { EmbeddingCall, EmbeddingResponse, ModelCall, ModelResponse } from '.'
import {
  ProviderInstance,
  getHealthyProviderInstance,
  isEventServiceClientInitialized,
  writeProviderInstance,
} from '..'
import { deleteModelCallConsumer, ensureModelCallConsumer } from './consumers'
import { publishProviderCallEvent } from './publish'
import { requestModelCall } from './request-model-call'
import { respondModelCall } from './respond-model-call'
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
    const TEST_PROVIDER_INSTANCE_HEALTH: ProviderInstance = {
      version: 1 as const,
      workspaceId: TEST_WORKSPACE_ID,

      status: 'healthy' as const,
      timestamp: new Date(),
      availableModelNames: [TEST_CONFIG.ollama.embeddingModelName!],
      loadedModelNames: [],
      processorUsagePercent: 10,
      totalMemoryMb: 12,
      usedMemoryMb: 4,
      providerInstanceId: 'test-instance',
      modelProvider: 'ollama',
      connection: {
        baseUrl: TEST_CONFIG.ollama.apiUrl!,
        apiKey: TEST_CONFIG.ollama.apiKey!,
      },
    }

    beforeAll(async () => {
      await isEventServiceClientInitialized()
      await writeProviderInstance(TEST_PROVIDER_INSTANCE_HEALTH)
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

      const cleanup = await respondModelCall({
        handler: async ({ event }) => {
          if (event.workspaceId !== TEST_WORKSPACE_ID) {
            throw new Error('Received event for wrong workspace')
          }
          console.log('Handling direct model call event:', { event })
          const healtyService = await getHealthyProviderInstance({
            workspaceId: TEST_WORKSPACE_ID,
            modelProvider: 'ollama',
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
            providerInstanceUrl: healtyService.connection.baseUrl || null,
            processingDurationMs: 0,
          }
          responses.push(result)
          return result
        },
      })

      const response = await requestModelCall(modelCall, 60000)
      expect(response.modelCallType).toBe('generateEmbedding')
      expect(response.resultStatus).toBe('success')
      expect(responses.length).toBe(1)
      expect(responses[0]).toEqual(response)

      await cleanup()
    })
  })
