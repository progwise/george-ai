import { WorkspaceConfig, initializeEventServiceClient, workspaceConfig } from '..'

describe('event-service-client workspace tests', () => {
  const TEST_WORKSPACE_ID = `test-workspace-123_${Date.now()}`
  const TEST_WORKSPACE2_ID = `test-workspace-456_${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await initializeEventServiceClient()
  })

  afterAll(async () => {
    await workspaceConfig.deleteWorkspaceConfig(TEST_WORKSPACE_ID)
    await workspaceConfig.deleteWorkspaceConfig(TEST_WORKSPACE2_ID)
  })
  it('should register a new workspace', async () => {
    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      providerInstances: [
        {
          id: 'provider-1',
          modelProvider: 'ollama',
          apiKey: 'key-1',
          baseUrl: 'https://api.ollama.com',
        },
      ],
      languageModels: [
        {
          id: 'model-1',
          name: 'Ollama Model',
          modelProvider: 'ollama',
          canDoChatCompletion: true,
          canDoEmbedding: false,
          canDoFunctionCalling: false,
          canDoVision: false,
        },
      ],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(configEntry)

    const fetchedConfig = await workspaceConfig.getWorkspaceConfig(TEST_WORKSPACE_ID)
    expect(fetchedConfig).toEqual(configEntry)
  })

  it('should update an existing workspace', async () => {
    const updatedConfigEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      providerInstances: [
        {
          id: 'provider-1',
          modelProvider: 'ollama',
          apiKey: 'updated-key-1',
          baseUrl: 'https://api.ollama.com',
        },
        {
          id: 'provider-2',
          modelProvider: 'openai',
          apiKey: 'key-2',
          baseUrl: 'https://api.openai.com',
        },
      ],
      languageModels: [
        {
          id: 'model-1',
          name: 'Ollama Model',
          modelProvider: 'ollama',
          canDoChatCompletion: true,
          canDoEmbedding: false,
          canDoFunctionCalling: false,
          canDoVision: false,
        },
        {
          id: 'model-2',
          name: 'OpenAI GPT-4',
          modelProvider: 'openai',
          canDoChatCompletion: true,
          canDoEmbedding: true,
          canDoFunctionCalling: true,
          canDoVision: false,
        },
      ],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(updatedConfigEntry)

    const fetchedUpdatedConfig = await workspaceConfig.getWorkspaceConfig(TEST_WORKSPACE_ID)
    expect(fetchedUpdatedConfig).toEqual(updatedConfigEntry)
  })

  it('should delete a workspace', async () => {
    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE2_ID,
      providerInstances: [],
      languageModels: [],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(configEntry)

    let fetchedConfig = await workspaceConfig.getWorkspaceConfig(TEST_WORKSPACE2_ID)
    expect(fetchedConfig).toEqual(configEntry)

    await workspaceConfig.deleteWorkspaceConfig(TEST_WORKSPACE2_ID)

    fetchedConfig = await workspaceConfig.getWorkspaceConfig(TEST_WORKSPACE2_ID)
    expect(fetchedConfig).toBeNull()
  })

  it('should watch for workspace config changes', async () => {
    const changes: Array<{ operation: 'create' | 'update' | 'delete'; value: WorkspaceConfig | null }> = []
    const stopWatching = await workspaceConfig.watchWorkspaceConfigs(async (change) => {
      if (change.key.includes(TEST_WORKSPACE_ID)) {
        changes.push(change)
      }
    })

    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      providerInstances: [],
      languageModels: [],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(configEntry)

    const updatedConfigEntry: WorkspaceConfig = {
      ...configEntry,
      providerInstances: [
        {
          id: 'provider-1',
          modelProvider: 'ollama',
          apiKey: 'key-1',
          baseUrl: 'https://api.ollama.com',
        },
      ],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(updatedConfigEntry)

    await workspaceConfig.deleteWorkspaceConfig(TEST_WORKSPACE_ID)

    // Allow some time for the watch handler to be called
    await new Promise((resolve) => setTimeout(resolve, 500))

    const relevantChanges = changes.slice(-3) // Get the last 3 changes related to our test workspace
    expect(relevantChanges[0].operation).toBe('update')
    expect(relevantChanges[0].value).toEqual(configEntry)
    expect(relevantChanges[1].operation).toBe('update')
    expect(relevantChanges[1].value).toEqual(updatedConfigEntry)
    expect(relevantChanges[2].operation).toBe('delete')
    expect(relevantChanges[2].value).toBeNull()

    await stopWatching()
  })
})
