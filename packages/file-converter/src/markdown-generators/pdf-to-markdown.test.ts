import { createReadStream } from 'fs'

import { document, extraction, library, workspace } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('PDF to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-pdf-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_PDF_FILE_ID = 'test-pdf-file'

  beforeAll(async () => {
    const TEST_PDF_FILE_PATH = await getTestAssetLocalPath('sample-extraction.pdf')
    const stream = createReadStream(TEST_PDF_FILE_PATH)
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_PDF_FILE_ID,
      name: 'sample.pdf',
      mimeType: 'application/pdf',
      uri: 'legacy-uri',
    })
    await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_PDF_FILE_ID,
      stream,
    })
  })

  afterAll(async () => {
    await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should transform PDF to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_PDF_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'pdfExtraction',
      },
    })
  })

  it('should have the PDF extraction in the file', async () => {
    const fileInfo = await document.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_PDF_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'pdfExtraction')).toBeDefined()
  })

  it('should have the extraction metadata', async () => {
    const extractionManifest = await extraction.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_PDF_FILE_ID,
      extractionMethod: 'pdfExtraction',
    })

    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.storageStats.extractionBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction', async () => {
    const extractionReadStream = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_PDF_FILE_ID,
      extractionMethod: 'pdfExtraction',
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
