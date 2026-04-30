import { Readable } from 'stream'

import {
  ExtractionManifest,
  WorkspaceManifest,
  createDocument,
  createLibrary,
  createUser,
  createWorkspace,
  deleteLibrary,
  deleteUser,
  deleteWorkspace,
  getExtraction,
  getWorkspaceManifest,
  prepareUpload,
  uploadDocumentSource,
} from '@george-ai/app-domain'
import { publish } from '@george-ai/event-service-client'

describe.sequential('Should process action events', () => {
  let TEST_WORKSPACE_ID: string
  let TEST_LIBRARY_ID: string
  let TEST_FILE_ID: string
  let TEST_USER_ID: string
  let TEST_WORKSPACE_MANIFEST: WorkspaceManifest

  beforeAll(async () => {
    TEST_WORKSPACE_MANIFEST = await createWorkspace({ name: 'Test Workspace', slug: 'slug' })
    TEST_WORKSPACE_ID = TEST_WORKSPACE_MANIFEST.workspaceId

    const user = await createUser({
      username: `testuser-${Date.now()}`,
      defaultWorkspaceId: TEST_WORKSPACE_ID,
      email: `testuser-${Date.now()}@example.com`,
    })
    TEST_USER_ID = user.userId
    const library = await createLibrary(TEST_WORKSPACE_ID, {
      name: 'Test Library',
    })
    TEST_LIBRARY_ID = library.libraryId
  })

  afterAll(async () => {
    await deleteLibrary(TEST_WORKSPACE_MANIFEST, { libraryId: TEST_LIBRARY_ID })
    await deleteUser(TEST_USER_ID)
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
    const preparation = await prepareUpload({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      name: 'test.txt',
      mimeType: 'text/plain',
      originUri: 'actions/test.txt',
    })
    expect(preparation).toBeDefined()

    const result = await uploadDocumentSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      stream: Readable.from(['This is the content of the file.']),
    })

    expect(result).toBeDefined()
  })

  it('When I publish an extraction event for it...', async () => {
    await publish({
      action: 'documentExtraction',
      workspaceId: TEST_WORKSPACE_ID,
      version: 1,
      extractionMethod: 'textExtraction',
      documentId: TEST_FILE_ID,
      libraryId: TEST_LIBRARY_ID,
      verb: 'request',
      timestamp: new Date(),
    })
  })

  it('I should see the status completed event for the extraction', async () => {
    const maxWaitMs = 15000
    const pollIntervalMs = 500
    let elapsed = 0
    let extraction: ExtractionManifest | null = null
    while (!extraction && elapsed < maxWaitMs) {
      extraction = await getExtraction(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        documentId: TEST_FILE_ID,
        extractionMethod: 'textExtraction',
      })

      if (extraction) {
        continue
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      elapsed += pollIntervalMs
    }
    expect(extraction).toBeDefined()
    expect(extraction).not.toBeNull()
    expect(extraction!.extractionMethod).toBe('textExtraction')
    expect(extraction!.storageStats.physicalBytes).toBeGreaterThan(0)
    expect(extraction!.storageStats.extractionBytes).toBeGreaterThan(0)
  }, 20000)

  it('Should have updated the workspace storage stats accordingly', async () => {
    const workspace = await getWorkspaceManifest(TEST_WORKSPACE_ID)
    expect(workspace).toBeDefined()
    expect(workspace!.storageStats.physicalBytes).toBeGreaterThan(0)
    expect(workspace!.storageStats.extractionBytes).toBeGreaterThan(0)
  })
})
