import { Readable } from 'node:stream'

import { createExtraction, getExtraction, readExtraction } from '.'
import { document as doc, library as lib, workspace as ws } from '..'
import { DocumentManifest } from '../schema'

describe.sequential('Read and write extractions', () => {
  const TEST_WORKSPACE_ID = `test-workspace-extraction_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_FILE_ID = 'test-file'
  const TEST_SOURCE_CONTENT = 'This is the content of the source file.'
  let TEST_DOCUMENT_MANIFEST: DocumentManifest

  beforeAll(async () => {
    await ws.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await lib.create(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    TEST_DOCUMENT_MANIFEST = await doc.create(TEST_WORKSPACE_ID, {
      documentId: TEST_FILE_ID,
      libraryId: TEST_LIBRARY_ID,
      name: 'test-file.txt',
      mimeType: 'text/plain',
      uri: 'legacy://test-file.txt',
      creator: 'Test Author',
      creationDate: new Date(),
      originHash: 'abc',
      lastModifiedDate: new Date(),
    })

    const { ack } = await doc.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      stream: Readable.from([TEST_SOURCE_CONTENT]),
    })
    await ack()
  })

  afterAll(async () => {
    await ws.delete(TEST_WORKSPACE_ID)
  })

  it('Should fail without uploaded source file', async () => {
    await expect(createExtraction(TEST_DOCUMENT_MANIFEST, 'textExtraction')).rejects.toThrowError(/hash is required/i)
  })

  it('after uploading a file, should create an extraction manifest with correct metadata', async () => {
    const document = await doc.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
    })
    expect(document).toBeDefined()
    const { ack } = await doc.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      stream: Readable.from([TEST_SOURCE_CONTENT]),
    })
    await ack()

    const extractionWriter = await createExtraction(document!, 'textExtraction')

    await extractionWriter.write('This is the content of the extraction file.')
    const savedManifest = await extractionWriter.ack()

    console.log('Saved Extraction Manifest:', savedManifest)

    expect(savedManifest).toBeDefined()
    expect(savedManifest!.extractionMethod).toBe('textExtraction')
    expect(savedManifest!.sourceHash).toBe(document!.sourceHash)
    expect(savedManifest!.storageStats.extractionFileCount).toBe(1)
    expect(savedManifest!.storageStats.physicalFileCount).toBeGreaterThanOrEqual(2) // At least manifest + extraction file
    expect(savedManifest!.storageStats.extractionBytes).toBeGreaterThan(3) // Should have some content
  })

  it('should have updated the document manifest with extractions and extraction stats', async () => {
    const documentManifest = await doc.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
    })
    expect(documentManifest).toBeDefined()
    expect(documentManifest!.storageStats.extractionFileCount).toBe(1)
    expect(documentManifest!.storageStats.extractionBytes).toBeGreaterThan(3)
    expect(documentManifest!.storageStats.physicalFileCount).toBeGreaterThanOrEqual(2) // At least manifest + extraction file
    expect(documentManifest!.extractions).toBeDefined()
    expect(documentManifest!.extractions!.length).toBe(1)
    expect(documentManifest!.extractions![0].extractionMethod).toBe('textExtraction')
    expect(documentManifest!.extractions![0].sourceHash).toBe(documentManifest!.sourceHash)
    expect(documentManifest!.extractions![0].created).toBeDefined()
  })

  it('should read back the extraction file', async () => {
    const extractionReadStream = await readExtraction({
      ...TEST_DOCUMENT_MANIFEST,
      type: 'extraction',
      extractionMethod: 'textExtraction',
    })
    expect(extractionReadStream).toBeDefined()

    const contentChunks: Buffer[] = []
    for await (const chunk of extractionReadStream!) {
      contentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const extractedContent = Buffer.concat(contentChunks).toString('utf-8')
    expect(extractedContent).toBe('This is the content of the extraction file.')
  })

  it('Should get extraction manifest', async () => {
    const extractionManifest = await getExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      extractionMethod: 'textExtraction',
    })
    const documentManifest = await doc.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
    })
    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.storageStats).toBeDefined()
    expect(extractionManifest!.storageStats.extractionFileCount).toBe(1)
    expect(extractionManifest!.storageStats.physicalFileCount).toBe(2)
    expect(extractionManifest!.extractionMethod).toBe('textExtraction')
    expect(extractionManifest!.sourceHash).toBe(documentManifest!.sourceHash)

    expect(documentManifest!.storageStats.extractionBytes).toBe(extractionManifest!.storageStats.extractionBytes)
    expect(documentManifest!.storageStats.extractionFileCount).toBe(
      extractionManifest!.storageStats.extractionFileCount,
    )
    expect(documentManifest!.storageStats.physicalBytes).toBeGreaterThan(extractionManifest!.storageStats.physicalBytes)
    expect(documentManifest!.storageStats.physicalFileCount).toBeGreaterThan(
      extractionManifest!.storageStats.physicalFileCount,
    )
  })

  it('Should have updated library usage after adding an extraction file', async () => {
    const libraryManifest = await lib.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
    })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.storageStats.physicalFileCount).toBe(4) // 1 for source file, 1 for extraction manifest, 1 for extraction file, 1 for library metadata.json
    expect(libraryManifest!.storageStats.extractionFileCount).toBe(1)
    expect(libraryManifest!.storageStats.extractionBytes).toBeGreaterThan(3)
  })

  it('Should have updated nothing if the extraction is aborted', async () => {
    const document = await doc.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
    })
    expect(document).toBeDefined()
    const library = await lib.get(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    const workspace = await ws.get(TEST_WORKSPACE_ID)

    const extractionWriter = await createExtraction(document!, 'csvExtraction')

    await extractionWriter.write('This is some content for the CSV extraction.')
    await extractionWriter.nack()

    const documentAfter = await doc.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
    })
    const libraryAfter = await lib.get(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID })
    const workspaceAfter = await ws.get(TEST_WORKSPACE_ID)

    // Document stats should be unchanged
    expect(documentAfter!.storageStats).toEqual(document!.storageStats)
    expect(documentAfter!.extractions).toEqual(document!.extractions)

    // Library stats should be unchanged
    expect(libraryAfter!.storageStats).toEqual(library!.storageStats)

    // Workspace stats should be unchanged
    expect(workspaceAfter!.storageStats).toEqual(workspace!.storageStats)
  })

  it('should throw when reading non-existent extraction', async () => {
    await expect(
      readExtraction({
        ...TEST_DOCUMENT_MANIFEST,
        type: 'extraction',
        // @ts-expect-error - testing non-existent method
        extractionMethod: 'non-existent-method',
      }),
    ).rejects.toThrow()
  })

  it('should throw when requesting fragment on non-fragmented extraction', async () => {
    await expect(
      readExtraction(
        {
          ...TEST_DOCUMENT_MANIFEST,
          type: 'extraction',
          extractionMethod: 'textExtraction',
        },
        0,
      ),
    ).rejects.toThrow(/Fragments are not available/i)
  })
})
