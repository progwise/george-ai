import { createReadStream } from 'fs'

import { workspaceStorage } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('CSV to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-csv-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_CSV_FILE_ID = 'test-text-file'
  const TEST_CSV_FILE_PATH = await getTestAssetLocalPath('sample-extraction.csv')

  beforeAll(async () => {
    const stream = createReadStream(TEST_CSV_FILE_PATH)
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_CSV_FILE_ID,
      stream,
      meta: {
        mimeType: 'text/csv',
        originalName: 'test.csv',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'test-hash',
      },
    })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should transform CSV to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_CSV_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'csv-extraction',
      },
    })
  })

  it('should have the CSV extraction in the file', async () => {
    const fileInfo = await workspaceStorage.getFile(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_CSV_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'csv-extraction')).toBeDefined()
  })

  it('Should have the extraction metadata and fragments', async () => {
    const extraction = await workspaceStorage.getExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_CSV_FILE_ID,
      extractionMethod: 'csv-extraction',
    })

    expect(extraction).toBeDefined()
    expect(extraction?.fragmentCount).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_CSV_FILE_ID,
      extractionMethod: 'csv-extraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    expect(extractionContent).toContain('| Field | Value |')
    expect(extractionContent).toContain('| ordernumber | `TEST-0007` |')
  })
})
