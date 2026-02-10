import { directCall, respondDirectCall } from './request'
import { DiscoverModelsResponse, ProviderRequest, RequestDiscoverModels } from './schema'

describe.sequential('Provider Calls', () => {
  const TEST_WORKSPACE_ID = `test-workspace-provider-calls_${Date.now()}`
  const TEST_MODEL_DISCOVERY_REQUEST: RequestDiscoverModels = {
    version: 1,
    workspaceId: TEST_WORKSPACE_ID,
    connection: {
      version: 1,
      baseUrl: 'http://localhost:11434',
      apiKey: 'test-api-key',
    },
    providerId: 'test-id',
    callType: 'discoverModels',
  }

  beforeAll(async () => {})

  afterAll(async () => {})

  it('Should call model discovery and receive an error because no one is subscribed', async () => {
    const response = await directCall(TEST_MODEL_DISCOVERY_REQUEST).catch((error) => {
      expect(error).toBeDefined()
      expect(error.message).toContain('No responders available for subject')
    })
    expect(response).toBeUndefined()
  })

  it('Should successfully call model discovery and receive a response', async () => {
    const receivedRequests: ProviderRequest[] = []
    const cleanup = await respondDirectCall({
      workspaceId: TEST_WORKSPACE_ID,
      providerId: 'test-id',
      callType: 'discoverModels',
      handler: async (request) => {
        receivedRequests.push(request)
        const response: DiscoverModelsResponse = {
          version: 1,
          callType: 'discoverModels',
          provider: {
            version: 1,
            connection: TEST_MODEL_DISCOVERY_REQUEST.connection,
            id: '',
            modelProvider: 'openai',
          },
          models: [
            {
              name: 'gpt-3.5-turbo',
              canDoChatCompletion: true,
              canDoEmbedding: false,
              canDoFunctionCalling: false,
              canDoVision: false,
              modelProvider: 'openai',
              version: 1,
              id: 'gpt-3.5-turbo',
            },
          ],
        }
        return response
      },
    })

    const response = await directCall(TEST_MODEL_DISCOVERY_REQUEST)
    expect(response).toBeDefined()
    expect(response.version).toBe(1)
    expect(response.provider).toEqual({
      version: 1,
      connection: TEST_MODEL_DISCOVERY_REQUEST.connection,
      id: '',
      modelProvider: 'openai',
    })
    expect(response.models).toHaveLength(1)
    expect(response.models[0].name).toBe('gpt-3.5-turbo')
    expect(receivedRequests).toHaveLength(1)
    expect(receivedRequests[0]).toEqual(TEST_MODEL_DISCOVERY_REQUEST)

    await cleanup()
  })
})
