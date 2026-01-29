import { createReadStream } from 'fs'

import { workspaceStorage } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('EML to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-eml-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_EML_FILE_ID = 'test-eml-file'

  beforeAll(async () => {
    const TEST_EML_FILE_PATH = await getTestAssetLocalPath('sample-email-extraction.eml')
    const stream = createReadStream(TEST_EML_FILE_PATH)
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EML_FILE_ID,
      stream,
      meta: {
        mimeType: 'message/rfc822',
        originalName: 'test-email.eml',
        originalUpdatedAt: new Date().toISOString(),
        originalContentHash: 'test-hash',
      },
    })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should transform EML to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EML_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'eml-extraction',
      },
    })
  })

  it('should have the EML extraction in the file', async () => {
    const fileInfo = await workspaceStorage.getFile(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EML_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'eml-extraction')).toBeDefined()
  })

  it('should have the extraction metadata and fragments', async () => {
    const extraction = await workspaceStorage.getExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EML_FILE_ID,
      extractionMethod: 'eml-extraction',
    })

    expect(extraction).toBeDefined()
    expect(extraction!.extractedBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction with email headers', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_EML_FILE_ID,
      extractionMethod: 'eml-extraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    // Check email headers are present
    expect(extractionContent).toContain('Test Email for Extraction')
    expect(extractionContent).toContain('John Doe')
    expect(extractionContent).toContain('Jane Smith')

    // Check body content
    expect(extractionContent).toContain('test email')
  })
})
