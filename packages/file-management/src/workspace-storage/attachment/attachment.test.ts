import { Readable } from 'stream'

import { readAttachment, writeAttachment } from '.'
import { document as doc, extraction as ex, library as lib, workspace as ws } from '..'
import { DocumentManifest, ExtractionIdentifier, WorkspaceIdentifier } from '../schema'
import { listAttachments } from './list-attachments'

const now = new Date()

describe.sequential('Create and read extractions with attachments', () => {
  const TEST_WORKSPACE_ID = `test-workspace-attachment_${now.getTime()}`
  const TEST_WORKSPACE_IDENTIFIER: WorkspaceIdentifier = {
    workspaceId: TEST_WORKSPACE_ID,
    version: 1,
    type: 'workspace',
  }
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_FILE_ID = 'test-file'
  const TEST_SOURCE_CONTENT = 'This is the content of the source file.'
  let TEST_DOCUMENT_MANIFEST: DocumentManifest

  beforeAll(async () => {
    await ws.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await lib.create(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    TEST_DOCUMENT_MANIFEST = await doc.create(TEST_WORKSPACE_ID, {
      documentId: TEST_FILE_ID,
      libraryId: TEST_LIBRARY_ID,
      name: 'test-file.txt',
      mimeType: 'text/plain',
      uri: 'legacy://test-file.txt',
      creator: 'Test Author',
      creationDate: new Date(),
      originHash: 'abc',
      lastModifiedDate: new Date(),
    })
    const { ack } = await doc.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      stream: Readable.from([TEST_SOURCE_CONTENT]),
    })
    TEST_DOCUMENT_MANIFEST = await ack()
  })

  afterAll(async () => {
    // await ws.delete(TEST_WORKSPACE_ID)
  })

  it('Should list attachments for a document even with no attachments written', async () => {
    const attachments = await listAttachments(TEST_DOCUMENT_MANIFEST)
    expect(attachments).toEqual([])
  })

  it('should write an attachment for the workspace', async () => {
    const attachmentContent = 'This is the content of the workspace attachment.'
    await writeAttachment(TEST_WORKSPACE_IDENTIFIER, {
      attachmentFileName: 'workspace-attachment.txt',
      mimeType: 'text/plain',
      stream: Readable.from([attachmentContent]),
    })
  })

  it('should list attachments for the workspace', async () => {
    const attachments = await listAttachments(TEST_WORKSPACE_IDENTIFIER)
    expect(attachments).toEqual(['workspace-attachment.txt'])
  })

  it('should have updated the workspace manifest with the new attachment', async () => {
    const workspaceManifest = await ws.get(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.attachments).toBeDefined()
    expect(workspaceManifest!.attachments!.length).toBe(1)
    expect(workspaceManifest!.attachments![0].fileName).toBe('workspace-attachment.txt')
    expect(workspaceManifest!.attachments![0].mimeType).toBe('text/plain')
    expect(workspaceManifest!.attachments![0].size).toBe(
      Buffer.byteLength('This is the content of the workspace attachment.'),
    )
  })

  it('should write an extraction file with attachment', async () => {
    const extractionContent = 'This is the content of the extraction file.'
    const writer = await ex.create(TEST_DOCUMENT_MANIFEST, 'textExtraction')
    writer.write(extractionContent)
    const attachmentContent = 'This is the content of the attachment.'
    writer.addAttachment('attachment.txt', Readable.from([attachmentContent]), 'text/plain')

    const extractionWriteResult = await writer.ack()

    expect(extractionWriteResult).toBeDefined()
  })

  it('should see the attachment in the extraction manifest', async () => {
    const extraction = await ex.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      extractionMethod: 'textExtraction',
    })
    expect(extraction).toBeDefined()
    expect(extraction!.attachments).toBeDefined()
    expect(extraction!.attachments!.length).toBe(1)
    expect(extraction!.attachments![0].fileName).toBe('attachment.txt')
    expect(extraction!.attachments![0].mimeType).toBe('text/plain')
    expect(extraction!.attachments![0].size).toBe(Buffer.byteLength('This is the content of the attachment.'))
  })

  it('should read the extraction content and attachment content correctly', async () => {
    const extractionIdentifier: ExtractionIdentifier = {
      ...TEST_DOCUMENT_MANIFEST,
      type: 'extraction',
      extractionMethod: 'textExtraction',
    }
    const { stream: attachmentReadStream } = await readAttachment(extractionIdentifier, 'attachment.txt')

    const attachmentChunks: Buffer[] = []
    for await (const chunk of attachmentReadStream!) {
      attachmentChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const attachmentContent = Buffer.concat(attachmentChunks).toString('utf-8')
    expect(attachmentContent).toContain('This is the content of the attachment.')
  })

  it('Add attachments for fragmented extraction', async () => {
    const attachments = [
      { filename: 'attachment1.txt', content: 'This is the content of attachment 1.' },
      { filename: 'attachment2.txt', content: 'This is the content of attachment 2.' },
      { filename: 'attachment3.txt', content: 'This is the content of attachment 3.' },
    ]
    const writer = await ex.create(TEST_DOCUMENT_MANIFEST, 'htmlExtraction')

    writer.write('Main extraction content. Will add more fragments and attachments.\n')

    writer.addFragment(Readable.from(['This is the content of fragment 1.']))
    writer.addAttachment(attachments[0].filename, Readable.from([attachments[0].content]), 'text/plain')

    writer.write('Some more content in the main extraction file.\n')
    writer.addAttachment(attachments[1].filename, Readable.from([attachments[1].content]), 'text/plain')

    writer.addFragment(Readable.from(['This is the content of fragment 2.']))
    writer.addAttachment(attachments[2].filename, Readable.from([attachments[2].content]), 'text/plain')

    const extractionWriteResult = await writer.ack()
    expect(extractionWriteResult).toBeDefined()
    expect(extractionWriteResult!.fragmentCount).toBe(2)
    expect(extractionWriteResult!.attachments?.length).toBe(3)
  })

  it('should read attachments for fragmented extraction', async () => {
    const extractionIdentifier: ExtractionIdentifier = {
      ...TEST_DOCUMENT_MANIFEST,
      type: 'extraction',
      extractionMethod: 'htmlExtraction',
    }

    const attachments = await listAttachments(extractionIdentifier)
    expect(attachments).toEqual(['attachment1.txt', 'attachment2.txt', 'attachment3.txt'])
  })

  it('should read the content of attachments for fragmented extraction', async () => {
    const extractionIdentifier: ExtractionIdentifier = {
      ...TEST_DOCUMENT_MANIFEST,
      type: 'extraction',
      extractionMethod: 'htmlExtraction',
    }

    const attachmentContents: string[] = []
    for (const attachmentFileName of ['attachment1.txt', 'attachment2.txt', 'attachment3.txt']) {
      const { stream: attachmentReadStream } = await readAttachment(extractionIdentifier, attachmentFileName)

      const chunks: Buffer[] = []
      for await (const chunk of attachmentReadStream!) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }

      const content = Buffer.concat(chunks).toString('utf-8')
      attachmentContents.push(content)
    }

    expect(attachmentContents[0]).toBe('This is the content of attachment 1.')
    expect(attachmentContents[1]).toBe('This is the content of attachment 2.')
    expect(attachmentContents[2]).toBe('This is the content of attachment 3.')
  })
})
