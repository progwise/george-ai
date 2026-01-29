import { Readable } from 'stream'

import { workspaceStorage } from '.'

describe.sequential('Basic storage tests', () => {
  const TEST_WORKSPACE_ID = `test-workspace-storage_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'

  afterAll(async () => {
    // Clean up workspace after tests
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })
  it('Should create a workspace', async () => {
    const manifest = await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    expect(manifest.id).toBe(TEST_WORKSPACE_ID)
    expect(manifest.name).toBe('Test Workspace')
  })

  it('Should retrieve the created workspace', async () => {
    const manifest = await workspaceStorage.getWorkspace(TEST_WORKSPACE_ID)
    expect(manifest).toBeDefined()
    expect(manifest!.id).toBe(TEST_WORKSPACE_ID)
    expect(manifest!.name).toBe('Test Workspace')
    expect(manifest!.usage.sourceBytes).toBe(0)
  })

  it('Retrieving a non-existent workspace should return null', async () => {
    const manifest = await workspaceStorage.getWorkspace('non-existent-workspace')
    expect(manifest).toBeNull()
  })

  it('Should reconcile workspace usage', async () => {
    await workspaceStorage.reconcile(TEST_WORKSPACE_ID)
    const updatedManifest = await workspaceStorage.getWorkspace(TEST_WORKSPACE_ID)
    expect(updatedManifest).toBeDefined()
    expect(updatedManifest!.usage.sourceBytes).toBe(0)
    expect(updatedManifest!.usage.physicalBytes).toBeGreaterThan(0)
    expect(updatedManifest!.usage.sourceFiles).toBe(0)
    expect(updatedManifest!.usage.physicalFiles).toBe(1)
    expect(updatedManifest!.usage.extractions).toBe(0)
    expect(updatedManifest!.usage.activeExtractions).toBe(0)
  })

  it('Should create a library within the workspace', async () => {
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    const libraryManifest = await workspaceStorage.getLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.id).toBe(TEST_LIBRARY_ID)
    expect(libraryManifest!.name).toBe('Test Library')
  })

  it('Should write source file to the library', async () => {
    const fileManifest = await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: 'test-file',
      stream: Readable.from(['This is a test file content']),
      meta: {
        originalName: 'test-file.txt',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'abc',
        mimeType: 'text/plain',
      },
    })
    expect(fileManifest).toBeDefined()
    expect(fileManifest.id).toBe('test-file')
  })

  it('Should have updated library usage after adding a source file', async () => {
    // await workspaceStorage.reconcile(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    const libraryManifest = await workspaceStorage.getLibrary(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
    })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.usage.sourceFiles).toBe(1)
    expect(libraryManifest!.usage.sourceBytes).toBeGreaterThan(0)
  })

  it('Should have updated workspace usage after adding a source file', async () => {
    // await workspaceStorage.reconcile(TEST_WORKSPACE_ID)
    const workspaceManifest = await workspaceStorage.getWorkspace(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.usage.sourceFiles).toBe(1)
    expect(workspaceManifest!.usage.sourceBytes).toBeGreaterThan(0)
  })

  it('Should read back the stored source file', async () => {
    const readStream = await workspaceStorage.readSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: 'test-file',
    })
    const chunks: Buffer[] = []
    for await (const chunk of readStream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const fileContent = Buffer.concat(chunks).toString('utf-8')
    expect(fileContent).toBe('This is a test file content')
  })

  it('Should delete the library', async () => {
    await workspaceStorage.deleteLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    const libraryManifest = await workspaceStorage.getLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    expect(libraryManifest).toBeNull()
  })

  it('Should have updated workspace usage after deleting the library', async () => {
    // await workspaceStorage.reconcile(TEST_WORKSPACE_ID)
    const workspaceManifest = await workspaceStorage.getWorkspace(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.usage.sourceFiles).toBe(0)
    expect(workspaceManifest!.usage.sourceBytes).toBe(0)
  })
})
