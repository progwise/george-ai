import { createReadStream } from 'fs'

import { workspaceStorage } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('PDF to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-pdf-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_PDF_FILE_ID = 'test-pdf-file'

  beforeAll(async () => {
    const TEST_PDF_FILE_PATH = await getTestAssetLocalPath('sample-extraction.pdf')
    const stream = createReadStream(TEST_PDF_FILE_PATH)
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_PDF_FILE_ID,
      stream,
      meta: {
        mimeType: 'application/pdf',
        originalName: 'test.pdf',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'test-hash',
      },
    })
  })

  afterAll(async () => {
    // await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should transform PDF to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_PDF_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'pdf-extraction',
      },
    })
  })

  it('should have the PDF extraction in the file', async () => {
    const fileInfo = await workspaceStorage.getFile(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_PDF_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'pdf-extraction')).toBeDefined()
  })

  it('should have the extraction metadata', async () => {
    const extraction = await workspaceStorage.getExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_PDF_FILE_ID,
      extractionMethod: 'pdf-extraction',
    })

    expect(extraction).toBeDefined()
    expect(extraction!.extractedBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_PDF_FILE_ID,
      extractionMethod: 'pdf-extraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    // Check that markdown content was extracted
    expect(extractionContent.length).toBeGreaterThan(0)
  })
})
