import { deleteEntryOrThrow } from '../entry'

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await deleteEntryOrThrow(
    {
      type: 'workspace',
      workspaceId,
      version: 1,
    },
    `Workspace with id ${workspaceId} does not exist, cannot delete workspace.`,
  )
}
