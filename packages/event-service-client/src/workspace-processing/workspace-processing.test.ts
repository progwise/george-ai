import { ProcessingReply, ProcessingRequest, ProcessingStatus, default as workspaceProcessing } from '.'
import { initializeEventServiceClient } from '..'
import { EventType } from './common'

describe.sequential('Workspace Trigger Event Lifecycle', () => {
  const TEST_WORKSPACE_ID = `test-workspace-${Date.now()}`

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    await initializeEventServiceClient()
  })

  afterAll(async () => {
    await workspaceProcessing.deleteWorkspaceProcessingConsumers({ workspaceId: TEST_WORKSPACE_ID })
  })

  test('Publishing a workspace processing event', async () => {
    await workspaceProcessing.publishProcessingRequest({
      version: 1,
      workspaceId: TEST_WORKSPACE_ID,
      requestType: 'extractFile',
      extractionMethod: 'textExtraction',
      fileId: 'test-file-id',
      libraryId: 'test-library-id',
    })
  })

  test('initialize workspace for processing', async () => {
    await workspaceProcessing.ensureWorkspaceConsumers({
      workspaceId: TEST_WORKSPACE_ID,
    })
  })

  test('Stopping processing for the workspace', async () => {
    await workspaceProcessing.stopProcessing({
      workspaceId: TEST_WORKSPACE_ID,
      requestTypes: ['extractFile'],
    })

    const statusAfterStop = await workspaceProcessing.processingStatus({
      workspaceId: TEST_WORKSPACE_ID,
      requestType: 'extractFile',
    })
    expect(statusAfterStop).toBe('paused')
  })

  test('publish 10 embedding events', async () => {
    const publishPromises = []
    for (let i = 0; i < 10; i++) {
      publishPromises.push(
        workspaceProcessing.publishProcessingRequest({
          version: 1,
          workspaceId: TEST_WORKSPACE_ID,
          requestType: 'embedFile',
          extractionMethod: 'textExtraction',
          fileId: `test-file-id-${i}`,
          libraryId: 'test-library-id',
          embeddingModelName: 'test-model',
          embeddingModelProvider: 'openai',
        }),
      )
    }
    await Promise.all(publishPromises)
  })

  test('Subscribing to processing events for the workspace', async () => {
    const messages: { eventType: EventType; event: ProcessingRequest | ProcessingStatus | ProcessingReply }[] = []

    const unsubscribe = await workspaceProcessing.subscribeEvent({
      handler: async ({ eventType, event }) => {
        messages.push({ eventType, event })
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
      expect(msg.event.requestType).toBe('embedFile')
    })
    await unsubscribe()
  }, 30000)
})
