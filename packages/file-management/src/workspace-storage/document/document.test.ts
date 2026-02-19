import { Readable } from 'stream'

import { StorageStats, library as lib, workspace as ws } from '..'
import { createDocument } from './create-document'
import { getDocument } from './get-document'
import { writeSource } from './write-source'

describe.sequential('Document storage tests', () => {
  const TEST_WORKSPACE_ID = `test-workspace-document-${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_DOCUMENT_ID = 'test-document'

  beforeAll(async () => {
    await ws.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await lib.create(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
  })

  afterAll(() => {
    return ws.delete(TEST_WORKSPACE_ID)
  })

  it('Should create a document manifest', async () => {
    const documentManifest = await createDocument(TEST_WORKSPACE_ID, {
      documentId: TEST_DOCUMENT_ID,
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Document',
      mimeType: 'text/plain',
      uri: 'legacy://test-document.txt',
      creator: 'Test Author',
      creationDate: new Date(),
    })
    expect(documentManifest).toBeDefined()
  })

  it('Creating a document with the same id should throw an error', async () => {
    await expect(
      createDocument(TEST_WORKSPACE_ID, {
        documentId: TEST_DOCUMENT_ID,
        libraryId: TEST_LIBRARY_ID,
        name: 'Test Document',
        mimeType: 'text/plain',
        uri: 'legacy://test-document.txt',
        creator: 'Test Author',
        creationDate: new Date(),
      }),
    ).rejects.toThrowError()
  })

  it('Creating a document in a non-existent library should throw an error', async () => {
    await expect(
      createDocument(TEST_WORKSPACE_ID, {
        documentId: 'new-document',
        libraryId: 'non-existent-library',
        name: 'New Document',
        mimeType: 'text/plain',
        uri: 'legacy://new-document.txt',
        creator: 'Test Author',
        creationDate: new Date(),
      }),
    ).rejects.toThrowError()
  })

  it('Should get the created document manifest', async () => {
    const documentManifest = await getDocument(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCUMENT_ID,
    })
    expect(documentManifest).toBeDefined()
    expect(documentManifest!.documentId).toBe(TEST_DOCUMENT_ID)
    expect(documentManifest!.libraryId).toBe(TEST_LIBRARY_ID)
    expect(documentManifest!.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(documentManifest!.sourceHash).toBeUndefined()
  })

  describe.sequential('Write source tests', () => {
    let document_usage_before_write: StorageStats
    let document_usage_after_write: StorageStats
    it('Should upload a source file', async () => {
      const documentManifest = await getDocument(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        documentId: TEST_DOCUMENT_ID,
      })
      expect(documentManifest).toBeDefined()
      document_usage_before_write = documentManifest!.storageStats
      const sourceContent = 'This is the content of the source file.'
      const { ack } = await writeSource(documentManifest, Readable.from([sourceContent]))
      await ack()
    })

    it('Should have updated manifest after uploading source file', async () => {
      const documentManifest = await getDocument(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        documentId: TEST_DOCUMENT_ID,
      })
      document_usage_after_write = documentManifest!.storageStats
      expect(documentManifest).toBeDefined()
      expect(documentManifest!.sourceHash).toBeDefined()
    })

    it('Should have increased document usage', () => {
      console.log('Document usage before write:', document_usage_before_write)
      console.log('Document usage after write:', document_usage_after_write)
      expect(document_usage_after_write.physicalBytes).toBeGreaterThan(document_usage_before_write.physicalBytes)
      expect(document_usage_after_write.physicalFileCount).toBeGreaterThan(
        document_usage_before_write.physicalFileCount,
      )
    })
  })
})
