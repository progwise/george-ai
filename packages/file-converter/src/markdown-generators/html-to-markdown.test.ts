import { createReadStream } from 'fs'

import { document, extraction, getDocumentOrThrow, library, workspace } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('HTML to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-html-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_HTML_document_ID = 'test-html-document'

  beforeAll(async () => {
    const TEST_HTML_document_PATH = await getTestAssetLocalPath('sample-extraction.html')
    const stream = createReadStream(TEST_HTML_document_PATH)
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_HTML_document_ID,
      name: 'test.html',
      mimeType: 'text/html',
      uri: 'legacy-uri',
    })
    const { ack } = await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_HTML_document_ID,
      stream,
    })
    await ack()
  })

  afterAll(async () => {
    await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should transform HTML to Markdown', async () => {
    const document = await getDocumentOrThrow({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_HTML_document_ID,
    })
    await transformToMarkdown({
      document,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'htmlExtraction',
      },
    })
  })

  it('should have the HTML extraction in the document', async () => {
    const documentInfo = await document.get({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_HTML_document_ID,
    })

    expect(documentInfo).toBeDefined()
    expect(
      documentInfo?.extractions.find((extraction) => extraction.extractionMethod === 'htmlExtraction'),
    ).toBeDefined()
  })

  it('should have the extraction metadata', async () => {
    const extractionManifest = await extraction.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_HTML_document_ID,
      extractionMethod: 'htmlExtraction',
    })

    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction', async () => {
    const { stream: extractionReadStream } = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_HTML_document_ID,
      extractionMethod: 'htmlExtraction',
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
