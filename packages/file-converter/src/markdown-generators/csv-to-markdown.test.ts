import { createReadStream } from 'fs'

import { document, extraction, getDocumentOrThrow, library, workspace } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('CSV to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-csv-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_CSV_FILE_ID = 'test-text-file'
  const TEST_CSV_FILE_PATH = await getTestAssetLocalPath('sample-extraction.csv')

  beforeAll(async () => {
    const stream = createReadStream(TEST_CSV_FILE_PATH)
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_CSV_FILE_ID,
      name: 'test.csv',
      mimeType: 'text/csv',
      uri: 'legacy-uri',
    })
    const { ack } = await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_CSV_FILE_ID,
      stream,
    })
    await ack()
  })

  afterAll(async () => {
    await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should transform CSV to Markdown', async () => {
    const document = await getDocumentOrThrow({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_CSV_FILE_ID,
    })
    await transformToMarkdown({
      document,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'csvExtraction',
      },
    })
  })

  it('should have the CSV extraction in the file', async () => {
    const fileInfo = await document.get({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_CSV_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'csvExtraction')).toBeDefined()
  })

  it('Should have the extraction metadata and fragments', async () => {
    const extractionManifest = await extraction.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_CSV_FILE_ID,
      extractionMethod: 'csvExtraction',
    })

    expect(extractionManifest).toBeDefined()
    expect(extractionManifest?.fragmentCount).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction summary', async () => {
    const { stream: extractionReadStream } = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_CSV_FILE_ID,
      extractionMethod: 'csvExtraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    // output.md now contains a summary, row data is in fragments
    expect(extractionContent).toContain('CSV Extraction Summary')
    expect(extractionContent).toContain('**Rows**')
    expect(extractionContent).toContain('**Headers**')
  })
})
