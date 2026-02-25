import { ProcessingReply, ProcessingRequest, ProcessingStatus, default as workspaceProcessing } from '.'
import { isEventServiceClientInitialized } from '..'
import { EventType } from './common'

describe.sequential('Workspace Trigger Event Lifecycle', () => {
  const TEST_WORKSPACE_ID = `test-workspace-${Date.now()}`
  const TEST_PROCESSING_REQUEST: ProcessingRequest = {
    version: 1,
    workspaceId: TEST_WORKSPACE_ID,
    requestType: 'extractFile',
    extractionMethod: 'textExtraction',
    documentId: 'test-file-id',
    libraryId: 'test-library-id',
  }

  beforeAll(async () => {
    // Ensure workspace is clean before tests
    // await workspaceProcessing.deleteWorkspace({ workspaceId: TEST_WORKSPACE_ID })
    await isEventServiceClientInitialized()
  })

  afterAll(async () => {
    await workspaceProcessing.deleteWorkspace({ workspaceId: TEST_WORKSPACE_ID })
  })

  test('Publishing a workspace processing event', async () => {
    await workspaceProcessing.publishProcessingRequest(TEST_PROCESSING_REQUEST)
  })

  test('Check processing status for the workspace is still paused', async () => {
    const status = await workspaceProcessing.processingStatus({
      workspaceId: TEST_WORKSPACE_ID,
      requestType: 'extractFile',
    })
    expect(status).toBe('paused')
  })

  test('Start processing for the workspace', async () => {
    await workspaceProcessing.startProcessing({
      workspaceId: TEST_WORKSPACE_ID,
      requestTypes: ['extractFile'],
    })

    const extractFileStatusAfterStop = await workspaceProcessing.processingStatus({
      workspaceId: TEST_WORKSPACE_ID,
      requestType: 'extractFile',
    })
    expect(extractFileStatusAfterStop).toBe('running')
  })

  test('publish 10 embedding events', async () => {
    const publishPromises = []
    for (let i = 0; i < 10; i++) {
      publishPromises.push(
        workspaceProcessing.publishProcessingRequest({
          ...TEST_PROCESSING_REQUEST,
          requestType: 'embedFile',
          extractionMethod: 'textExtraction',
          documentId: `test-file-id-${i}`,
          embeddingModelName: 'test-model',
          embeddingModelProvider: 'openai',
        }),
      )
    }
    await Promise.all(publishPromises)
  })

  test('Subscribing to processing events for the workspace should only receive events for started request types', async () => {
    const messages: { eventType: EventType; event: ProcessingRequest | ProcessingStatus | ProcessingReply }[] = []

    const unsubscribe = await workspaceProcessing.subscribeEvent({
      handler: async ({ eventType, event }) => {
        messages.push({ eventType, event })
      },
    })
    await new Promise((resolve, reject) => {
      let checkCount = 0
      const checkMessages = () => {
        checkCount++
        if (messages.length > 1) {
          reject(true)
        } else if (checkCount > 50) {
          resolve(true)
        } else {
          setTimeout(checkMessages, 100)
        }
      }
      checkMessages()
    }) // wait for subscription to be ready
    expect(messages.length).toBeGreaterThan(0)

    messages.forEach((msg) => {
      expect(msg.event.workspaceId).toBe(TEST_WORKSPACE_ID)
      expect(msg.event.requestType).toBe('extractFile')
    })
    await unsubscribe()
  }, 30000)

  test('Start processing for embedFile request type', async () => {
    await workspaceProcessing.startProcessing({
      workspaceId: TEST_WORKSPACE_ID,
      requestTypes: ['embedFile'],
    })

    const embedFileStatusAfterStop = await workspaceProcessing.processingStatus({
      workspaceId: TEST_WORKSPACE_ID,
      requestType: 'embedFile',
    })
    expect(embedFileStatusAfterStop).toBe('running')
  })

  test('...and verify events are received', async () => {
    const messages: { eventType: EventType; event: ProcessingRequest | ProcessingStatus | ProcessingReply }[] = []

    const unsubscribe = await workspaceProcessing.subscribeEvent({
      handler: async ({ eventType, event }) => {
        messages.push({ eventType, event })
      },
    })
    await new Promise((resolve, reject) => {
      let checkCount = 0
      const checkMessages = () => {
        checkCount++
        if (messages.length >= 10) {
          resolve(true)
        } else if (checkCount > 30) {
          reject(new Error('Did not receive all expected messages in time'))
        } else {
          setTimeout(checkMessages, 100)
        }
      }
      checkMessages()
    }) // wait for subscription to be ready

    expect(messages.length).toBeGreaterThanOrEqual(10)

    messages.forEach((msg) => {
      expect(msg.event.workspaceId).toBe(TEST_WORKSPACE_ID)
      expect(msg.event.requestType).toBe('embedFile')
    })
    await unsubscribe()
  })

  test('Throwing an error during event handling should result in message being redelivered', async () => {
    let firstAttempt = true
    let receivedEvents = 0

    const unsubscribe = await workspaceProcessing.subscribeEvent({
      handler: async ({ eventType, event }) => {
        if (eventType === 'request' && event.requestType === 'embedFile') {
          receivedEvents++
          if (firstAttempt) {
            firstAttempt = false
            throw new Error('Simulated processing error')
          }
        }
      },
    })

    await workspaceProcessing.publishProcessingRequest({
      ...TEST_PROCESSING_REQUEST,
      requestType: 'embedFile',
      documentId: 'test-file-id-redelivery',
      embeddingModelName: 'test-model',
      embeddingModelProvider: 'openai',
    })

    await new Promise((resolve, reject) => {
      let checkCount = 0
      const checkMessages = () => {
        checkCount++
        if (receivedEvents >= 2) {
          resolve(true)
        } else if (checkCount > 50) {
          reject(new Error('Did not receive redelivered message in time'))
        } else {
          setTimeout(checkMessages, 100)
        }
      }
      checkMessages()
    }) // wait for subscription to be ready

    expect(receivedEvents).toBeGreaterThanOrEqual(2)

    await unsubscribe()
  }, 30000)
})
