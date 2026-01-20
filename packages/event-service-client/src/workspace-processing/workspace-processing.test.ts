import { initializeEventServiceClient } from '..'
import { ProcessEvent, default as workspaceProcessing } from '../workspace-processing'

process.env.LOG_LEVEL = 'INFO'

describe.sequential('Workspace Processing Event Lifecycle', () => {
  const TEST_WORKSPACE_ID = `test-workspace-${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await initializeEventServiceClient()
  })

  afterAll(async () => {
    await workspaceProcessing.deleteWorkspaceProcessingConsumers({ workspaceId: TEST_WORKSPACE_ID })
  })

  test('Publishing a workspace processing event', async () => {
    await workspaceProcessing.publishRequestEvent({
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      processType: 'extraction',
      extractionMethod: 'test-method',
      fileId: 'test-file-id',
      libraryId: 'test-library-id',
    })
  })

  test('initialize workspace for processing', async () => {
    await workspaceProcessing.ensureWorkspaceProcessingConsumers({
      workspaceId: TEST_WORKSPACE_ID,
      maxPendingMessages: 10,
    })
  })

  test('Checking processing status for the workspace', async () => {
    const status = await workspaceProcessing.processingStatus({
      workspaceId: TEST_WORKSPACE_ID,
      processType: 'extraction',
    })
    expect(status).toBe('running')
  })

  test('Stopping processing for the workspace', async () => {
    await workspaceProcessing.stopProcessing({
      workspaceId: TEST_WORKSPACE_ID,
      processType: 'extraction',
    })

    const statusAfterStop = await workspaceProcessing.processingStatus({
      workspaceId: TEST_WORKSPACE_ID,
      processType: 'extraction',
    })
    expect(statusAfterStop).toBe('paused')
  })

  test('publish 100 embedding events', async () => {
    const publishPromises = []
    for (let i = 0; i < 10; i++) {
      publishPromises.push(
        workspaceProcessing.publishRequestEvent({
          version: 1,
          workspaceId: TEST_WORKSPACE_ID,
          processType: 'embedding',
          extractionMethod: 'test-method',
          fileId: `test-file-id-${i}`,
          libraryId: 'test-library-id',
          fileFragmentId: `fragment-${i}`,
        }),
      )
    }
    await Promise.all(publishPromises)
  })

  test('Subscribing to processing events for the workspace', async () => {
    const messages: { event: ProcessEvent; error: unknown }[] = []

    const unsubscribe = await workspaceProcessing.subscribeProcessEvent({
      processType: 'embedding',
      handler: async ({ event, error }) => {
        messages.push({ event, error })
      },
    })
    await new Promise((resolve) => {
      const checkMessages = () => {
        if (messages.length >= 10) {
          resolve(true)
        } else {
          setTimeout(checkMessages, 100)
        }
      }
      checkMessages()
    }) // wait for subscription to be ready
    expect(messages.length).toBe(10)
    expect(messages[0].event.workspaceId).toBe(TEST_WORKSPACE_ID)
    messages.forEach((msg) => {
      expect(msg.event.processType).toBe('embedding')
    })
    await unsubscribe()
  })
})
