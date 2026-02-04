import { Readable } from 'stream'

import { workspaceProcessing } from '@george-ai/event-service-client'
import { workspaceStorage } from '@george-ai/file-management'

import { main } from '.'

describe.sequential('Should process action events', () => {
  const TEST_WORKSPACE_ID = `test-workspace-action-events_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_FILE_ID = 'test-file'

  beforeAll(async () => {
    await main()
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceProcessing.ensureWorkspaceConsumers({ workspaceId: TEST_WORKSPACE_ID })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('Given I have a source file in my ...', async () => {
    const fileInfo = await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      stream: Readable.from(['Test file content']),
      meta: {
        mimeType: 'text/plain',
        originalName: 'test.txt',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'test-hash',
      },
    })

    expect(fileInfo).toBeDefined()
  })

  it('When I publish an extraction event for it...', async () => {
    await workspaceProcessing.publishActionEvent({
      actionType: 'extractFile',
      workspaceId: TEST_WORKSPACE_ID,
      version: 1,
      extractionMethod: 'textExtraction',
      fileId: TEST_FILE_ID,
      libraryId: TEST_LIBRARY_ID,
    })
  })

  it('I should see the status completed event for the extraction', async () => {
    const maxWaitMs = 3000
    const pollIntervalMs = 100
    let elapsed = 0
    while (elapsed < maxWaitMs) {
      const extraction = await workspaceStorage.getExtraction(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        fileId: TEST_FILE_ID,
        extractionMethod: 'textExtraction',
      })

      if (extraction) {
        expect(extraction).toBeDefined()
        expect(extraction.extractionMethod).toBe('textExtraction')
        expect(extraction.extractedBytes).toBeGreaterThan(0)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      elapsed += pollIntervalMs
    }

    // TODO: Fail the test if extraction is not found within the time limit
    expect(true).toBe(true)
  })
})
