import { createReadStream } from 'fs'

import { document, extraction, library, workspace } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('EML to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-eml-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_EML_FILE_ID = 'test-eml-file'

  beforeAll(async () => {
    const TEST_EML_FILE_PATH = await getTestAssetLocalPath('sample-email-extraction.eml')
    const stream = createReadStream(TEST_EML_FILE_PATH)
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EML_FILE_ID,
      name: 'sample.eml',
      mimeType: 'message/rfc822',
      uri: 'legacy-uri',
    })
    await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EML_FILE_ID,
      stream,
    })
  })

  afterAll(async () => {
    await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should transform EML to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EML_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'emlExtraction',
      },
    })
  })

  it('should have the EML extraction in the file', async () => {
    const fileInfo = await document.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EML_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'emlExtraction')).toBeDefined()
  })

  it('should have the extraction metadata and fragments', async () => {
    const extractionManifest = await extraction.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EML_FILE_ID,
      extractionMethod: 'emlExtraction',
    })

    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction with email headers', async () => {
    const extractionReadStream = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_EML_FILE_ID,
      extractionMethod: 'emlExtraction',
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
