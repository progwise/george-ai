import { deleteAttachment } from '../attachment'

export async function deleteWorkspaceAttachment(
  workspaceId: string,
  parameters: { attachmentFileName: string },
): Promise<boolean> {
  const { attachmentFileName } = parameters
  return deleteAttachment(
    {
      type: 'workspace',
      workspaceId,
      version: 1,
    },
    {
      attachmentFileName,
    },
  )
}
