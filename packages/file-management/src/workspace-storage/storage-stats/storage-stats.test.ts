import { createDocument, getDocument } from '../document'
import { createLibrary, getLibrary } from '../library'
import { createWorkspace, deleteWorkspace, getWorkspace } from '../workspace'

describe.sequential('Storage stats accuracy', () => {
  const TEST_WORKSPACE_ID = `test-workspace-storage-stats_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_DOCUMENT_ID = 'test-document'

  beforeAll(async () => {
    // Setup code to create a workspace, library, and document with attachments and extractions
    await createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace for Storage Stats' })
    await createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await createDocument(TEST_WORKSPACE_ID, {
      documentId: TEST_DOCUMENT_ID,
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Document',
      mimeType: 'text/plain',
      uri: 'legacy://test-document.txt',
    })
  })

  afterAll(async () => {
    // Cleanup code to delete the workspace and all its contents
    await deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('A document has one physical file', async () => {
    const documentManifest = await getDocument({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCUMENT_ID,
    })
    expect(documentManifest).toBeDefined()
    expect(documentManifest!.storageStats.physicalFileCount).toBe(1)
    expect(documentManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('... and the library has 2 physical files (library manifest + document manifest)', async () => {
    const libraryManifest = await getLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.storageStats.physicalFileCount).toBe(2)
    expect(libraryManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('... and the workspace has 3 physical files (workspace manifest + library manifest + document manifest)', async () => {
    const workspaceManifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.storageStats.physicalFileCount).toBe(3)
    expect(workspaceManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })
})
