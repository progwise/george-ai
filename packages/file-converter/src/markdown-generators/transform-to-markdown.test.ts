import { Readable } from 'stream'

import { document, extraction, getDocumentOrThrow, library, workspace } from '@george-ai/file-management'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('Convert to Markdown', () => {
  const TEST_WORKSPACE_ID = `test-workspace-transform-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_TEXT_FILE_ID = 'test-text-file'
  const TEST_TEXT_CONTENT = 'This is a simple text file.'

  beforeAll(async () => {
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_TEXT_FILE_ID,
      name: 'test.txt',
      mimeType: 'text/plain',
      uri: 'legacy-uri',
    })
    const { ack } = await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_TEXT_FILE_ID,
      stream: Readable.from([TEST_TEXT_CONTENT]),
    })
    await ack()
  })

  afterAll(async () => {
    //await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should convert text to Markdown', async () => {
    const document = await getDocumentOrThrow({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_TEXT_FILE_ID,
    })

    // Perform the conversion
    await transformToMarkdown({
      document,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'textExtraction',
      },
    })
  })

  it('File should have the extraction', async () => {
    const fileInfo = await document.get({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_TEXT_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'textExtraction')).toBeDefined()
  })

  it('should read the Markdown extraction', async () => {
    const { stream: extractionReadStream } = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_TEXT_FILE_ID,
      extractionMethod: 'textExtraction',
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
