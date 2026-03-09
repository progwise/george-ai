import { WorkspaceConfig, deleteRegistryEntry, getRegistryEntry, watchRegistry, writeRegistryEntry } from '.'
import { isEventServiceClientInitialized } from '..'

describe('event-service-client workspace tests', () => {
  const TEST_WORKSPACE_ID = `test-workspace-123_${Date.now()}`
  const TEST_WORKSPACE2_ID = `test-workspace-456_${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await isEventServiceClientInitialized()
  })

  afterAll(async () => {
    await deleteRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE_ID })
    await deleteRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE2_ID })
  })
  it('should register a new workspace', async () => {
    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      modelHosts: [
        {
          hostId: 'provider-1',
          connection: {
            driver: 'ollama',
            encryptedApiKey: 'key-1',
            baseUrl: 'https://api.ollama.com',
          },
        },
      ],
      activeModels: [
        {
          name: 'model-1',
          driver: 'ollama',
          canDoChatCompletion: true,
          canDoEmbedding: false,
          canDoFunctionCalling: false,
          canDoVision: false,
          version: 1,
        },
      ],
      lastUpdate: new Date(),
      type: 'workspace',
    }
    await writeRegistryEntry(configEntry)

    const fetchedConfig = await getRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE_ID })
    expect(fetchedConfig).toEqual(configEntry)
  })

  it('should update an existing workspace', async () => {
    const updatedConfigEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      modelHosts: [
        {
          hostId: 'provider-1',
          connection: {
            driver: 'ollama',
            encryptedApiKey: 'updated-key-1',
            baseUrl: 'https://api.ollama.com',
          },
        },
        {
          hostId: 'provider-2',
          connection: {
            driver: 'openai',
            encryptedApiKey: 'key-2',
            baseUrl: 'https://api.openai.com',
          },
        },
      ],
      activeModels: [
        {
          name: 'model-1',
          driver: 'ollama',
          version: 1,
          canDoEmbedding: false,
          canDoChatCompletion: false,
          canDoVision: false,
          canDoFunctionCalling: false,
        },
      ],
      lastUpdate: new Date(),
      type: 'workspace',
    }
    await writeRegistryEntry(updatedConfigEntry)

    const fetchedUpdatedConfig = await getRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE_ID })
    expect(fetchedUpdatedConfig).toEqual(updatedConfigEntry)
  })

  it('should delete a workspace', async () => {
    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WORKSPACE2_ID,
      modelHosts: [],
      activeModels: [],
      lastUpdate: new Date(),
      type: 'workspace',
    }
    await writeRegistryEntry(configEntry)

    const fetchedConfig = await getRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE2_ID })
    expect(fetchedConfig).toEqual(configEntry)

    await deleteRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE2_ID })

    const deletedConfig = await getRegistryEntry({ type: 'workspace', workspaceId: TEST_WORKSPACE2_ID })
    expect(deletedConfig).toBeNull()
  })

  it('should watch for workspace config changes', async () => {
    const TEST_WATCH_WORKSPACE_ID = `watch-workspace-test-${Date.now()}`
    const changes: Array<{
      workspaceId: string
      hostId?: string
      operation: 'update' | 'delete'
      value: WorkspaceConfig | null
    }> = []

    let resolver: (value: number | PromiseLike<number>) => void = () => {}
    const receivedEntriesPromise = new Promise<number>((resolve) => {
      resolver = resolve
    })

    const stopWatching = await watchRegistry('workspace', async ({ workspaceId, hostId, entry, operation }) => {
      if (workspaceId === TEST_WATCH_WORKSPACE_ID) {
        changes.push({ workspaceId, hostId, operation, value: entry })
        if (changes.length > 2) {
          resolver(changes.length)
        }
      }
    })

    const configEntry: WorkspaceConfig = {
      version: 1,
      workspaceId: TEST_WATCH_WORKSPACE_ID,
      modelHosts: [],
      activeModels: [],
      lastUpdate: new Date(),
      type: 'workspace',
    }
    await writeRegistryEntry(configEntry)

    const updatedConfigEntry: WorkspaceConfig = {
      ...configEntry,
      modelHosts: [
        {
          hostId: 'provider-1',
          connection: {
            driver: 'ollama',
            encryptedApiKey: 'key-1',
            baseUrl: 'https://api.ollama.com',
          },
        },
      ],
      lastUpdate: new Date(),
    }
    await writeRegistryEntry(updatedConfigEntry)

    await deleteRegistryEntry({ type: 'workspace', workspaceId: TEST_WATCH_WORKSPACE_ID })

    await receivedEntriesPromise

    expect(changes.length).toBe(3)
    expect(changes[0].operation).toBe('update')
    expect(changes[0].value).toEqual(configEntry)
    expect(changes[1].operation).toBe('update')
    expect(changes[1].value).toEqual(updatedConfigEntry)
    expect(changes[2].operation).toBe('delete')
    expect(changes[2].value).toBeNull()

    await stopWatching()
  })
})
