import { Readable } from 'stream'

import { workspaceStorage } from '..'

describe('Create and read extractions with attachments', () => {
  const TEST_WORKSPACE_ID = `test-workspace-attachment_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_FILE_ID = 'test-file'
  const TEST_SOURCE_CONTENT = 'This is the content of the source file.'

  beforeAll(async () => {
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      stream: Readable.from([TEST_SOURCE_CONTENT]),
      meta: {
        originalName: 'test-file.txt',
        originalUpdatedAt: new Date().toISOString(),
        mimeType: 'text/plain',
        originalContentHash: 'abc',
      },
    })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should write an extraction file with attachment', async () => {
    const extractionContent = 'This is the content of the extraction file.'
    const writer = await workspaceStorage.createExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'text-extraction-with-attachment',
    })

    writer.write(extractionContent)
    const attachmentContent = 'This is the content of the attachment.'
    writer.addAttachment('attachment.txt', Readable.from([attachmentContent]), 'text/plain')

    const extractionWriteResult = await writer.finish()

    expect(extractionWriteResult).toBeDefined()
  })

  it('should read an extraction file with attachment', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'text-extraction-with-attachment',
    })

    const contentChunks: Buffer[] = []
    for await (const chunk of extractionReadStream!) {
      contentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const extractedContent = Buffer.concat(contentChunks).toString('utf-8')
    expect(extractedContent).toContain('This is the content of the extraction file.')

    const attachmentReadStream = await workspaceStorage.readAttachment(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'text-extraction-with-attachment',
      filename: 'attachment.txt',
    })

    const attachmentChunks: Buffer[] = []
    for await (const chunk of attachmentReadStream!) {
      attachmentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const attachmentContent = Buffer.concat(attachmentChunks).toString('utf-8')
    expect(attachmentContent).toContain('This is the content of the attachment.')
  })

  it('Add attachments for fragmented extraction', async () => {
    const extractionContent = [
      'This is the content of the fragmented extraction file.',
      '--fragment--',
      'Here is the second fragment of the extraction.',
      '--fragment--',
      'Finally, this is the last fragment.',
    ]

    const attachments = [
      { filename: 'attachment1.txt', content: 'This is the content of attachment 1.' },
      { filename: 'attachment2.txt', content: 'This is the content of attachment 2.' },
      { filename: 'attachment3.txt', content: 'This is the content of attachment 3.' },
    ]
    const writer = await workspaceStorage.createExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'text-extraction-with-attachments-fragmented',
      splitFragmentPattern: '--fragment--',
    })

    writer.write(extractionContent[0])
    writer.addAttachment(attachments[0].filename, Readable.from([attachments[0].content]), 'text/plain')
    writer.write(extractionContent[1])

    writer.write(extractionContent[2])
    writer.addAttachment(attachments[1].filename, Readable.from([attachments[1].content]), 'text/plain')
    writer.write(extractionContent[3])

    writer.write(extractionContent[4])
    writer.addAttachment(attachments[2].filename, Readable.from([attachments[2].content]), 'text/plain')

    const extractionWriteResult = await writer.finish()
    expect(extractionWriteResult).toBeDefined()
    expect(extractionWriteResult!.fragmentCount).toBe(3)
    expect(extractionWriteResult!.attachments?.length).toBe(3)
  })

  it('Read extraction and check for linked attachments', async () => {
    const fileInfo = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'text-extraction-with-attachments-fragmented',
    })

    const contentChunks: Buffer[] = []
    for await (const chunk of fileInfo!) {
      contentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const extractedContent = Buffer.concat(contentChunks).toString('utf-8')
    expect(extractedContent).toContain('This is the content of the fragmented extraction file.')
    expect(extractedContent).toContain('Here is the second fragment of the extraction.')
    expect(extractedContent).toContain('Finally, this is the last fragment.')

    for (let i = 1; i <= 3; i++) {
      const attachmentReadStream = await workspaceStorage.readAttachment(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        fileId: TEST_FILE_ID,
        extractionMethod: 'text-extraction-with-attachments-fragmented',
        filename: `attachment${i}.txt`,
      })

      const attachmentChunks: Buffer[] = []
      for await (const chunk of attachmentReadStream!) {
        attachmentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }

      const attachmentContent = Buffer.concat(attachmentChunks).toString('utf-8')
      expect(attachmentContent).toContain(`This is the content of attachment ${i}.`)
    }
  })
})
