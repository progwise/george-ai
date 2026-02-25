import { Readable } from 'node:stream'

import { writeAttachment } from '../attachment'
import { createWorkspace } from './create-workspace'
import { deleteWorkspace } from './delete-workspace'
import { deleteWorkspaceAttachment } from './delete-workspace-attachment'
import { getWorkspace } from './get-workspace'

describe.sequential('Workspace accuracy', () => {
  const TEST_WORKSPACE_ID = `test-workspace_${Date.now()}`

  afterAll(async () => {
    // Cleanup code to delete the workspace and all its contents
    await deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('Should create a workspace manifest with correct metadata', async () => {
    const workspaceManifest = await createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest.workspaceId).toBe(TEST_WORKSPACE_ID)
    expect(workspaceManifest.name).toBe('Test Workspace')
    expect(workspaceManifest.created).toBeDefined()
    expect(workspaceManifest.storageStats.physicalFileCount).toBe(1) // Only the workspace manifest file itself
    expect(workspaceManifest.storageStats.physicalBytes).toBeGreaterThan(0)
    expect(workspaceManifest.storageStats.attachmentBytes).toBe(0)
    expect(workspaceManifest.storageStats.extractionBytes).toBe(0)
    expect(workspaceManifest.storageStats.attachmentFileCount).toBe(0)
    expect(workspaceManifest.storageStats.extractionFileCount).toBe(0)
    expect(workspaceManifest.attachments).toEqual([])
  })

  it('Should not allow creating a workspace with an existing id', async () => {
    await expect(createWorkspace(TEST_WORKSPACE_ID, { name: 'Duplicate Workspace' })).rejects.toThrow(
      `Workspace with id ${TEST_WORKSPACE_ID} already exists.`,
    )
  })

  it('Should allow adding an attachment', async () => {
    const attachment = await writeAttachment(
      {
        type: 'workspace',
        workspaceId: TEST_WORKSPACE_ID,
        version: 1,
      },
      {
        attachmentFileName: 'test-attachment.txt',
        mimeType: 'text/plain',
        stream: Readable.from(['This is a test attachment.']),
      },
    )
    expect(attachment).toBeDefined()
    expect(attachment.fileName).toBe('test-attachment.txt')
    expect(attachment.mimeType).toBe('text/plain')
    expect(attachment.size).toBeGreaterThan(0)
    expect(attachment.createdAt).toBeDefined()
    expect(attachment.version).toBe(1)
  })

  it('Should have updated the workspace manifest with the new attachment and updated stats', async () => {
    const workspaceManifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.attachments).toHaveLength(1)
    expect(workspaceManifest!.attachments![0].fileName).toBe('test-attachment.txt')
    expect(workspaceManifest!.storageStats.attachmentFileCount).toBe(1)
    expect(workspaceManifest!.storageStats.attachmentBytes).toBeGreaterThan(0)
    expect(workspaceManifest!.storageStats.physicalFileCount).toBeGreaterThanOrEqual(2) // Workspace manifest + attachment file
    expect(workspaceManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })

  it('Should delete the attachment', async () => {
    // Implement the test for deleting the attachment
    const result = await deleteWorkspaceAttachment(TEST_WORKSPACE_ID, {
      attachmentFileName: 'test-attachment.txt',
    })
    expect(result).toBe(true)
  })

  it('Should have updated the workspace manifest after deleting the attachment', async () => {
    const workspaceManifest = await getWorkspace(TEST_WORKSPACE_ID)
    expect(workspaceManifest).toBeDefined()
    expect(workspaceManifest!.attachments).toHaveLength(0)
    expect(workspaceManifest!.storageStats.attachmentFileCount).toBe(0)
    expect(workspaceManifest!.storageStats.attachmentBytes).toBe(0)
    // Physical file count and bytes should have decreased by at least 1 and the size of the attachment respectively
    expect(workspaceManifest!.storageStats.physicalFileCount).toBeGreaterThanOrEqual(1) // At least the workspace manifest should remain
    expect(workspaceManifest!.storageStats.physicalBytes).toBeGreaterThan(0)
  })
})
