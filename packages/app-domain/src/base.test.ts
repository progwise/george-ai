import { createReadStream } from 'fs'

import { prisma } from '@george-ai/app-database'
import { getTestAssetLocalPath } from '@george-ai/test-utils'

import { document, library, workspace } from '.'

describe.sequential('Base sequential flow', () => {
  const now = Date.now()
  let TEST_WORKSPACE_ID: string
  let TEST_LIBRARY_ID: string
  let TEST_FILE_ID: string

  it('Should create a workspace', async () => {
    const result = await workspace.createWorkspace({
      name: 'Test Workspace',
      slug: `test-workspace-${now}`,
    })
    expect(result).toBeDefined()
    expect(result.workspaceId).toBeDefined()
    expect(result.slug).toBeDefined()
    TEST_WORKSPACE_ID = result.workspaceId
  })

  it('Should create a user', async () => {
    const result = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `testuser${now}@example.com`,
        username: `testuser${now}`,
        defaultWorkspaceId: TEST_WORKSPACE_ID,
        workspaceMemberships: {
          create: {
            workspaceId: TEST_WORKSPACE_ID,
            role: 'owner',
          },
        },
      },
    })
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
  })

  it('Should create a library', async () => {
    const result = await library.createLibrary(TEST_WORKSPACE_ID, {
      name: 'Test Library',
    })
    expect(result).toBeDefined()
    expect(result.libraryId).toBeDefined()
    TEST_LIBRARY_ID = result.libraryId
  })

  it('Should create a file', async () => {
    const result = await document.createDocument(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      name: 'Test File',
      originalContentHash: 'abc123',
      originModificationDate: new Date(),
      mimeType: 'application/pdf',
      originUri: 'progwise://example.com/test-file.txt',
    })
    expect(result).toBeDefined()
    expect(result.documentId).toBeDefined()
    TEST_FILE_ID = result.documentId
  })

  it('Should prepare an upload for the file', async () => {
    const result = await document.prepareUpload({
      workspaceId: TEST_WORKSPACE_ID,
      libraryId: TEST_LIBRARY_ID,
      mimeType: 'application/pdf',
      name: 'Test File',
      originUri: 'progwise://example.com/test-file.txt',
    })
    expect(result).toBeDefined()
  })

  it('Should upload the file content', async () => {
    const filePath = await getTestAssetLocalPath('sample-extraction.pdf')
    const stream = createReadStream(filePath)
    const result = await document.uploadDocumentSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      stream: stream,
    })
    expect(result).toBeDefined()
  })
})
