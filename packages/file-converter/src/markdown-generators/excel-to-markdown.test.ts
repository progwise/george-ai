import { createReadStream } from 'fs'

import { document, extraction, getDocumentOrThrow, library, workspace } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('Excel to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-excel-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_EXCEL_FILE_ID = 'test-excel-file'

  beforeAll(async () => {
    const TEST_EXCEL_FILE_PATH = await getTestAssetLocalPath('sample-extraction.xlsx')
    const stream = createReadStream(TEST_EXCEL_FILE_PATH)
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EXCEL_FILE_ID,
      name: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uri: 'legacy-uri',
    })
    const { ack } = await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EXCEL_FILE_ID,
      stream,
    })
    await ack()
  })

  afterAll(async () => {
    await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should transform Excel to Markdown', async () => {
    const document = await getDocumentOrThrow({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EXCEL_FILE_ID,
    })
    await transformToMarkdown({
      document,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'excelExtraction',
      },
    })
  })

  it('should have the Excel extraction in the file', async () => {
    const fileInfo = await document.get({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EXCEL_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'excelExtraction')).toBeDefined()
  })

  it('should have the extraction metadata and fragments', async () => {
    const extractionManifest = await extraction.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EXCEL_FILE_ID,
      extractionMethod: 'excelExtraction',
    })

    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
    expect(extractionManifest!.fragmentCount).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction summary', async () => {
    const { stream: extractionReadStream } = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EXCEL_FILE_ID,
      extractionMethod: 'excelExtraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    console.log('Extraction Content:\n', extractionContent)

    // output.md now contains a summary, row data is in fragments
    expect(extractionContent).toContain('Excel Extraction Summary')
    expect(extractionContent).toContain('**Sheets**')
    expect(extractionContent).toContain('**Total Rows**')
  })
})
