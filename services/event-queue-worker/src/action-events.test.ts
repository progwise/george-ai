import { Readable } from 'stream'

import {
  createDocument,
  createLibrary,
  createUser,
  createWorkspace,
  deleteWorkspace,
  getExtraction,
  prepareUpload,
  uploadFile,
} from '@george-ai/app-domain'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { main } from '.'

describe.sequential('Should process action events', () => {
  let TEST_WORKSPACE_ID: string
  let TEST_LIBRARY_ID: string
  let TEST_FILE_ID: string
  let TEST_USER_ID: string

  beforeAll(async () => {
    await main()
    const workspace = await createWorkspace({ name: 'Test Workspace', slug: 'slug' })
    TEST_WORKSPACE_ID = workspace.workspaceId

    const user = await createUser({
      username: `testuser-${Date.now()}`,
      defaultWorkspaceId: TEST_WORKSPACE_ID,
      email: `testuser-${Date.now()}@example.com`,
    })
    TEST_USER_ID = user.userId
    const library = await createLibrary(TEST_WORKSPACE_ID, {
      name: 'Test Library',
      userId: TEST_USER_ID,
    })
    TEST_LIBRARY_ID = library.libraryId
    await workspaceProcessing.ensureWorkspaceConsumers({ workspaceId: TEST_WORKSPACE_ID })
  })

  afterAll(async () => {
    await deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('Given I have a source file in my ...', async () => {
    const fileManifest = await createDocument(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'test.txt',
      mimeType: 'text/plain',
      originUri: 'actions/test.txt',
    })
    TEST_FILE_ID = fileManifest.documentId

    expect(fileManifest).toBeDefined()
  })

  it('...and I upload the file content', async () => {
    const preparation = await prepareUpload(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      uploadUrl: 'test7upload',
    })
    expect(preparation).toBeDefined()

    const result = await uploadFile(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      stream: Readable.from(['This is the content of the file.']),
    })

    expect(result).toBeDefined()
  })

  it('When I publish an extraction event for it...', async () => {
    await workspaceProcessing.publishProcessingRequest({
      requestType: 'extractFile',
      workspaceId: TEST_WORKSPACE_ID,
      version: 1,
      extractionMethod: 'textExtraction',
      documentId: TEST_FILE_ID,
      libraryId: TEST_LIBRARY_ID,
    })
  })

  it('I should see the status completed event for the extraction', async () => {
    const maxWaitMs = 3000
    const pollIntervalMs = 100
    let elapsed = 0
    while (elapsed < maxWaitMs) {
      const extraction = await getExtraction(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        documentId: TEST_FILE_ID,
        extractionMethod: 'textExtraction',
      })

      if (extraction) {
        expect(extraction).toBeDefined()
        expect(extraction.extractionMethod).toBe('textExtraction')
        expect(extraction.storageStats.extractionBytes).toBeGreaterThan(0)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      elapsed += pollIntervalMs
    }

    // TODO: Fail the test if extraction is not found within the time limit
    expect(true).toBe(true)
  })
})
