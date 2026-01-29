import { Readable } from 'stream'

import { workspaceStorage } from '@george-ai/file-management'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('Convert to Markdown', () => {
  const TEST_WORKSPACE_ID = `test-workspace-transform-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_TEXT_FILE_ID = 'test-text-file'
  const TEST_TEXT_CONTENT = 'This is a simple text file.'

  beforeAll(async () => {
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_TEXT_FILE_ID,
      stream: Readable.from([TEST_TEXT_CONTENT]),
      meta: {
        mimeType: 'text/plain',
        originalName: 'test.txt',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'test-hash',
      },
    })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should convert text to Markdown', async () => {
    // Perform the conversion
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_TEXT_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'text-extraction',
      },
    })
  })

  it('File should have the extraction', async () => {
    const fileInfo = await workspaceStorage.getFile(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_TEXT_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'text-extraction')).toBeDefined()
  })

  it('should read the Markdown extraction', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_TEXT_FILE_ID,
      extractionMethod: 'text-extraction',
    })
    expect(extractionReadStream).toBeDefined()

    const chunks: Buffer[] = []
    for await (const chunk of extractionReadStream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const extractedContent = Buffer.concat(chunks).toString('utf-8')
    expect(extractedContent).toBe(TEST_TEXT_CONTENT)
  })
})
