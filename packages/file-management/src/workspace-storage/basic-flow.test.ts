import { Readable } from 'node:stream'

import { createDocument, readSource, writeSource } from './document'
import { createLibrary, deleteLibrary, getLibrary } from './library'
import reconcile from './reconcile'
import { createWorkspace, deleteWorkspace, getWorkspace } from './workspace'

describe.sequential('Basic storage tests', () => {
  const TEST_WORKSPACE_ID = `test-workspace-storage_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'

  afterAll(async () => {
    // Clean up workspace after tests
    await deleteWorkspace(TEST_WORKSPACE_ID)
  })
  it('Should create a workspace', async () => {
    const manifest = await createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    expect(manifest.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(manifest.name).toBe('Test Workspace')
  })

  it('Should retrieve the created workspace', async () => {
    const manifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(manifest).toBeDefined()
    expect(manifest!.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(manifest!.name).toBe('Test Workspace')
    expect(manifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('Retrieving a non-existent workspace should return null', async () => {
    const manifest = await getWorkspace('non-existent-workspace')
    expect(manifest).toBeNull()
  })

  it('Should reconcile workspace usage', async () => {
    await reconcile({ workspaceId: TEST_WORKSPACE_ID, type: 'workspace', version: 1 })
    const updatedManifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(updatedManifest).toBeDefined()
    expect(updatedManifest!.storageStats.attachmentBytes).toBe(0)
    expect(updatedManifest!.storageStats.attachmentFileCount).toBe(0)
    expect(updatedManifest!.storageStats.extractionBytes).toBe(0)
    expect(updatedManifest!.storageStats.extractionFileCount).toBe(0)
    expect(updatedManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
    expect(updatedManifest!.storageStats.physicalFileCount).toBe(1) // The workspace manifest file itself
  })

  it('Should create a library within the workspace', async () => {
    await createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    const libraryManifest = await getLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.libraryId).toBe(TEST_LIBRARY_ID)
    expect(libraryManifest!.name).toBe('Test Library')
  })

  it('Should create document manifest within the library', async () => {
    const fileManifest = await createDocument(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: 'test-file',
      name: 'test-file.txt',
      mimeType: 'text/plain',
      uri: 'legacy://test-file.txt',
      creator: 'Testuser',
      creationDate: new Date(),
      lastModifiedDate: new Date(),
      originHash: 'abc',
    })
    expect(fileManifest).toBeDefined()
    expect(fileManifest.documentId).toBe('test-file')
  })

  it('Should have updated library usage after adding a document', async () => {
    const libraryManifest = await getLibrary(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
    })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.storageStats.physicalFileCount).toBe(2)
    expect(libraryManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('Should have updated workspace usage after adding a document', async () => {
    const libraryManifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.storageStats.physicalFileCount).toBe(2)
    expect(libraryManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('Should upload a source file and update stats accordingly', async () => {
    const fileContent = 'This is a test file content'
    const { ack } = await writeSource(
      {
        workspaceId: TEST_WORKSPACE_ID,
        libraryId: TEST_LIBRARY_ID,
        documentId: 'test-file',
        type: 'document',
        version: 1,
      },
      Readable.from([fileContent]),
    )
    await ack()
  })

  it('Should have updated workspace usage after adding a source file', async () => {
    // await workspaceStorage.reconcile(TEST_WORKSPACE_ID)
    const workspaceManifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.storageStats.physicalFileCount).toBe(3)
    expect(workspaceManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('Should read back the stored source file', async () => {
    const { stream: readStream } = await readSource({
      libraryId: TEST_LIBRARY_ID,
      documentId: 'test-file',
      workspaceId: TEST_WORKSPACE_ID,
      version: 1,
      type: 'document',
    })
    const chunks: Buffer[] = []
    for await (const chunk of readStream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const fileContent = Buffer.concat(chunks).toString('utf-8')
    expect(fileContent).toBe('This is a test file content')
  })

  it('Should delete the library', async () => {
    await deleteLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    const libraryManifest = await getLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    expect(libraryManifest).toBeNull()
  })

  it('Should have updated workspace usage after deleting the library', async () => {
    // await workspaceStorage.reconcile(TEST_WORKSPACE_ID)
    const workspaceManifest = await getWorkspace(TEST_WORKSPACE_ID)
    const workspaceManifestSize = Buffer.from(JSON.stringify(workspaceManifest)).length
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.storageStats.physicalFileCount).toBe(1)
    expect(workspaceManifest!.storageStats.physicalBytes).toBeGreaterThan(workspaceManifestSize - 50) // Estimated size of the manifest file itself
  })
})
