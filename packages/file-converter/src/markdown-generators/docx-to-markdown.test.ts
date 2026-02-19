import { createReadStream } from 'fs'

import { document, extraction, library, workspace } from '@george-ai/file-management'
import { getTestAssetLocalPath } from '@george-ai/test-utils'

import { transformToMarkdown } from './transform-to-markdown'

describe.sequential('DOCX to Markdown', async () => {
  const TEST_WORKSPACE_ID = `test-workspace-docx-to-markdown_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_DOCX_FILE_ID = 'test-docx-file'
  const TEST_DOCX_FILE_PATH = await getTestAssetLocalPath('sample-extraction-document.docx')

  beforeAll(async () => {
    const stream = createReadStream(TEST_DOCX_FILE_PATH)
    await workspace.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await library.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test Library',
    })
    await document.create(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCX_FILE_ID,
      name: 'test.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uri: 'legacy-uri',
    })
    await document.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCX_FILE_ID,
      stream,
    })
  })

  afterAll(async () => {
    await workspace.delete(TEST_WORKSPACE_ID)
  })

  it('should transform DOCX to Markdown', async () => {
    await transformToMarkdown({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCX_FILE_ID,
      timeoutSignal: new AbortController().signal,
      options: {
        extractionMethod: 'docxExtraction',
      },
    })
  })

  it('should have the DOCX extraction in the file', async () => {
    const fileInfo = await document.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCX_FILE_ID,
    })

    expect(fileInfo).toBeDefined()
    expect(fileInfo?.extractions.find((extraction) => extraction.extractionMethod === 'docxExtraction')).toBeDefined()
  })

  it('Should have the extraction metadata', async () => {
    const extractionManifest = await extraction.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCX_FILE_ID,
      extractionMethod: 'docxExtraction',
    })

    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.storageStats.extractionBytes).toBeGreaterThan(0)
  })

  it('should read the Markdown extraction', async () => {
    const extractionReadStream = await extraction.read(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_DOCX_FILE_ID,
      extractionMethod: 'docxExtraction',
    })

    expect(extractionReadStream).toBeDefined()

    const chunks: string[] = []
    for await (const chunk of extractionReadStream) {
      chunks.push(chunk)
    }
    const extractionContent = chunks.join('\n')

    expect(extractionContent).toContain('Coffee')
  })
})
