import { WorkspaceConfig, isEventServiceClientInitialized, workspaceConfig } from '..'

describe('event-service-client workspace tests', () => {
  const TEST_WORKSPACE_ID = `test-workspace-123_${Date.now()}`
  const TEST_WORKSPACE2_ID = `test-workspace-456_${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await isEventServiceClientInitialized()
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
          providerInstanceId: 'provider-1',
          workspaceId: TEST_WORKSPACE_ID,
          modelProvider: 'ollama',
          connection: {
            apiKey: 'key-1',
            baseUrl: 'https://api.ollama.com',
          },
          version: 1,
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
          version: 1,
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
          providerInstanceId: 'provider-1',
          workspaceId: TEST_WORKSPACE_ID,
          modelProvider: 'ollama',
          connection: {
            apiKey: 'updated-key-1',
            baseUrl: 'https://api.ollama.com',
          },
          version: 1,
        },
        {
          providerInstanceId: 'provider-2',
          workspaceId: TEST_WORKSPACE_ID,
          modelProvider: 'openai',
          connection: {
            apiKey: 'key-2',
            baseUrl: 'https://api.openai.com',
          },
          version: 1,
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
          version: 1,
        },
        {
          id: 'model-2',
          name: 'OpenAI GPT-4',
          modelProvider: 'openai',
          canDoChatCompletion: true,
          canDoEmbedding: true,
          canDoFunctionCalling: true,
          canDoVision: false,
          version: 1,
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
    const TEST_WATCH_WORKSPACE_ID = `test-watch-workspace-${Date.now()}`
    const changes: Array<{ operation: 'update' | 'delete'; value: WorkspaceConfig | null }> = []

    const stopWatching = await workspaceConfig.watchWorkspaceConfigs(async (change) => {
      if (change.workspaceId === TEST_WATCH_WORKSPACE_ID) {
        changes.push(change)
      }
    })

    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WATCH_WORKSPACE_ID,
      providerInstances: [],
      languageModels: [],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(configEntry)

    const updatedConfigEntry: WorkspaceConfig = {
      ...configEntry,
      providerInstances: [
        {
          providerInstanceId: 'provider-1',
          modelProvider: 'ollama',
          connection: {
            apiKey: 'key-1',
            baseUrl: 'https://api.ollama.com',
          },
          version: 1,
          workspaceId: TEST_WATCH_WORKSPACE_ID,
        },
      ],
      lastUpdate: new Date().toISOString(),
    }
    await workspaceConfig.writeWorkspaceConfig(updatedConfigEntry)

    await workspaceConfig.deleteWorkspaceConfig(TEST_WATCH_WORKSPACE_ID)

    // Allow some time for the watch handler to be called
    await new Promise((resolve) => {
      let tries = 0
      const interval = setInterval(() => {
        if (changes.length >= 3 || tries > 20) {
          clearInterval(interval)
          resolve(true)
        }
        tries++
      }, 50)
    })

    expect(changes.length).toBe(3)
    expect(changes[0].operation).toBe('update')
    expect(changes[0].value).toEqual(configEntry)
    expect(changes[1].operation).toBe('update')
    expect(changes[1].value).toEqual(updatedConfigEntry)
    expect(changes[2].operation).toBe('delete')
    expect(changes[2].value).toBeNull()

    await stopWatching()
  }, 30000)
})
