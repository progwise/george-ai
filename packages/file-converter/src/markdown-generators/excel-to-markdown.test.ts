import { createReadStream } from 'fs'

import { workspaceStorage } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('Excel to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-excel-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_EXCEL_FILE_ID = 'test-excel-file'

  beforeAll(async () => {
    const TEST_EXCEL_FILE_PATH = await getTestAssetLocalPath('sample-extraction.xlsx')
    const stream = createReadStream(TEST_EXCEL_FILE_PATH)
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EXCEL_FILE_ID,
      stream,
      meta: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        originalName: 'test.xlsx',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'test-hash',
      },
    })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should transform Excel to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EXCEL_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'excel-extraction',
      },
    })
  })

  it('should have the Excel extraction in the file', async () => {
    const fileInfo = await workspaceStorage.getFile(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EXCEL_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'excel-extraction')).toBeDefined()
  })

  it('should have the extraction metadata', async () => {
    const extraction = await workspaceStorage.getExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EXCEL_FILE_ID,
      extractionMethod: 'excel-extraction',
    })

    expect(extraction).toBeDefined()
    expect(extraction!.extractedBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction with table structure', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EXCEL_FILE_ID,
      extractionMethod: 'excel-extraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    // Check that markdown table structure is present
    expect(extractionContent).toContain('|')
    expect(extractionContent).toContain('---')
  })
})
