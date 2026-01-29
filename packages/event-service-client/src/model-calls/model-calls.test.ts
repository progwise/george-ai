import { ModelCall } from '.'
import { initializeEventServiceClient, providerHealth } from '..'
import { deleteProviderInstanceConsumer, ensureProviderInstanceConsumer } from './consumers'
import { publishProviderCallEvent } from './publish'
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
  .sequential('Provider Calls', () => {
    const TEST_WORKSPACE_ID = `test-workspace-provider-calls_${Date.now()}`
    const TEST_PROVIDER_INSTANCE_HEALTH = {
      workspaceId: TEST_WORKSPACE_ID,
      providerInstance: {
        modelProvider: 'ollama' as const,
        id: 'test-instance',
        baseUrl: TEST_CONFIG.ollama.apiUrl!,
        apiKey: TEST_CONFIG.ollama.apiKey!,
      },
      status: 'healthy' as const,
      timestamp: new Date().toISOString(),
      version: 1 as const,
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
      await deleteProviderInstanceConsumer({
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
        timestamp: new Date().toISOString(),
      })
    })

    it('enable workspace for receiving provider calls', async () => {
      await ensureProviderInstanceConsumer({
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
  })
