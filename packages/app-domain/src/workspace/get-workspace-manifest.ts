import { WorkspaceManifest, workspace } from '@george-ai/file-management'

import { DomainError } from '../error'

export async function getWorkspaceManifest(workspaceId: string): Promise<WorkspaceManifest> {
  const workspaceManifest = await workspace.get(workspaceId)
  if (!workspaceManifest) {
    throw new DomainError('Workspace not found', 'library')
  }
  return workspaceManifest
}
